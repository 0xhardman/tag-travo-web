import { createContext } from "react";
import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import { setupToken } from '@/utils/AuthUtils';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Typography } from '@mui/material';
import { set } from "react-hook-form";
import { GetDataToSign, GetScanResult, GetTags, Login, Relation, VerifySign } from "@/utils/APIs";
import { User } from "@/utils/interfaces";
import { getLocalStorage } from "@/utils/StorageUtils";
import { Tag } from "@/utils/APIs";
import { StringUtils } from "@/utils/StringUtils";
import { SignType } from "@/type";
import { useRouter } from "next/router";
import {useGenerateZKProofs} from "@/hooks/zk/useGenerateZKProofs";
import {SignInfo} from "@/hooks/useSign";
const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-goerli.safe.global'
}

// Instantiate and initialize the pack


interface Web3AuthContextType {
    address: string,
    login: () => Promise<void>,
    aaSignIn: () => void,
    sign: (message: string) => Promise<string>,
    web3BioRelations: Relation[],
    setWeb3BioRelations: (relations: Relation[]) => void,
    relations: Relation[],
    setRelations: (relations: Relation[]) => void,
    user: User,
    setUser: (user: User) => void,
    tags: Tag[],
    handleSign: (type?: SignType) => void
}

export const Web3AuthContext = createContext({} as Web3AuthContextType);

export const Web3AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter()
    const clientId =
        process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ??
        "BOZ_Bpk52QEjIZheU6fcq3e8ZGsHaoJizs7vbT5HPJN9cITsnR6ky2CFV3jvor_yKt42wk44sNYmPdXSfKhcSow";
    const [timestamp, setTimestamp] = useState('')
    const [message, setMessage] = useState('')
    const [open, setOpen] = useState(false)
    const [web3authPack, setWeb3authPack] = useState<Web3AuthModalPack | null>(null);
    const [user, setUser] = useState<User>({} as User);

    const [relations, setRelations] = useState<Relation[]>([]);
    const [web3BioRelations, setWeb3BioRelations] = useState<Relation[]>([]);

    const [tags, setTags] = useState<Tag[]>([])
    const [type, setType] = useState<SignType>('login' as SignType)

    const [provider, setProvider] = useState<IProvider | null>(null);
    const [address, setAddress] = useState<string>("");

    const {
        generateZKProofs, mint, progress,
        isPreparing, isGenerating, isMinting
    } = useGenerateZKProofs(user, [...relations, ...web3BioRelations])

    const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
            label: 'torus',
            showOnModal: false
        },
        [WALLET_ADAPTERS.METAMASK]: {
            label: 'metamask',
            showOnDesktop: true,
            showOnMobile: false
        }
    }
    const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://mainnet.infura.io/v3/fd3c3b7b49c84a90ad027e1bfacf2fb8",
        displayName: "Ethereum Mainnet",
        blockExplorer: "https://goerli.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
    };
    const options: Web3AuthOptions = {
        clientId,
        web3AuthNetwork: "sapphire_devnet",
        chainConfig: chainConfig,
        uiConfig: {
            // theme: 'dark',
            loginMethodsOrder: ['google', 'facebook']
        }
    }
    const privateKeyProvider = new CommonPrivateKeyProvider({
        config: { chainConfig },
    });
    const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
            mfaLevel: "none",
        },
        adapterSettings: {},
        // fixing_modal_issue_start
        // privateKeyProvider,
        // fixing_modal_issue_end
    });

    const sign = useCallback(async (message: string) => {
        try {
            const p = web3authPack?.getProvider()
            const provider = new ethers.providers.Web3Provider(p as ExternalProvider)
            const signer = await provider.getSigner()
            // const message = 'hello world'
            // const address = '0x7FD69E691F8b8f7Fa416CDCaFD41eDB32E0Eb3c8'
            const res = await signer.signMessage(message)
            console.log(res)
            return res
        } catch (error) {
            console.log(error)
            return "error"
        }

    }, [web3authPack])
    const handleSign = async (type = 'login') => {
        let data = await GetDataToSign({ address, type: type as SignType });
        const timestamp = Date.now().toString();
        setTimestamp(timestamp)
        const res = StringUtils.fillData2Str(data.data, { timestamp: timestamp }, false)
        setType(type as SignType)
        setMessage(res)
    }
    const aaSignIn = useCallback(async () => {
        const data = await web3authPack?.signIn()
        console.log({ data })
        if (!data?.eoa) return
        setAddress(data?.eoa)
    }, [web3authPack]);
    const login = async () => {
        const userRelations = await Login({})
        console.log(userRelations)
        setRelations(userRelations.relations)
        setUser(userRelations.user)
        setWeb3BioRelations(userRelations.web3BioRelations)
    }
    const handleClose = () => {
        setOpen(false);
    };
    const handleSignConfirm = useCallback(async () => {
        const signature: string = await sign(message)
        if (signature == "error") {
            console.log("sig error")
        }
        const signInfo = { address, params: { timestamp }, type, signature }
        switch (type) {
            case 'login':
                const { key } = await VerifySign(signInfo)
                setupToken(key, 'login', true)
                await login();
                router.push('aggregator')
                break;
            case 'zkproof':
                console.log("zkproof")
                await generateZKProofs(address, signInfo as SignInfo<"zkproof">);
                await mint(signInfo);
                // TODO: ZKProof完了做什么？
                break;
        }
        setMessage("")
        setOpen(false)
    }, [type, address, timestamp, message])
    useEffect(() => {
        (
            async () => {
                const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)
                const web3auth = new Web3Auth(options);
                web3auth.configureAdapter(openloginAdapter);
                await web3auth.initModal();
                const res = await web3AuthModalPack.init({ options: options as any, adapters: [openloginAdapter as any], modalConfig })
                setWeb3authPack(web3AuthModalPack)
                console.log(res)
            }
        )()
    }, [])
    useEffect(() => {
        async () => {
            const info = await web3authPack?.getUserInfo() as { eoa: string }
            setAddress(info?.eoa)
        }
    }, [web3authPack])
    useEffect(() => {
        const token = getLocalStorage('token-login')
        if (token && Object.keys(user).length == 0) {
            login()
        }

    }, [])
    useEffect(() => {
        (async () => {
            if (router.pathname.startsWith('/merchant')) {
                console.log("merchant")
                return
            }
            const combineRelation = [...relations, ...web3BioRelations]
            if (combineRelation.length == 0) return
            const allTags = await GetTags({})
            const result = await GetScanResult({})
            const rootSet = new Set<string>()
            Object.keys(result.rootResults).forEach((key) => {
                result.rootResults[key].forEach((id: string) => {
                    combineRelation.forEach((relation) => {
                        const combineId = relation.type + ':' + relation.id
                        if (id.toUpperCase() == combineId.toUpperCase())
                            rootSet.add(key)
                    })
                })
            })
            console.log(rootSet)
            // console.log({ result, allTags })

            const tags = new Set<Tag>()
            rootSet.forEach((root) => {
                const tag = allTags.forEach((tag) => {
                    // console.log(tag, tag.addressesRoot, root)
                    if (tag.addressesRoot.toUpperCase() == root.toUpperCase()) {
                        tags.add(tag)
                    }

                })

            })
            // console.log(tags)
            setTags(Array.from(tags) as Tag[])
            // console.log()
        })()
    }, [relations, web3BioRelations])
    useEffect(() => {
        if (!message) {
            return
        }
        setOpen(true)
    }, [message])
    return <Web3AuthContext.Provider value={{
        address, aaSignIn, login, sign, web3BioRelations, setWeb3BioRelations, relations, setRelations, user, setUser, tags, handleSign
    }}>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                AA Sign Confirm
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Disagree</Button>
                <Button onClick={handleSignConfirm} autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
        {children}</Web3AuthContext.Provider >
}
