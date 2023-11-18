import { createContext } from "react";
import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import { set } from "react-hook-form";
import { GetDataToSign, Relation } from "@/utils/APIs";
import { User } from "@/utils/interfaces";
const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-goerli.safe.global'
}

// Instantiate and initialize the pack


interface Web3AuthContextType {
    address: string,
    login: () => void,
    sign: (message: string) => Promise<string>,
    web3BioRelations: Relation[],
    setWeb3BioRelations: (relations: Relation[]) => void,
    relations: Relation[],
    setRelations: (relations: Relation[]) => void,
    user: User,
    setUser: (user: User) => void
}

export const Web3AuthContext = createContext({} as Web3AuthContextType);

export const Web3AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const clientId =
        process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ??
        "BOZ_Bpk52QEjIZheU6fcq3e8ZGsHaoJizs7vbT5HPJN9cITsnR6ky2CFV3jvor_yKt42wk44sNYmPdXSfKhcSow";
    const [web3authPack, setWeb3authPack] = useState<Web3AuthModalPack | null>(null);
    const [web3BioRelations, setWeb3BioRelations] = useState<Relation[]>([]);
    const [user, setUser] = useState<User>({} as User);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [provider, setProvider] = useState<IProvider | null>(null);
    const [address, setAddress] = useState<string>("");
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
        web3AuthNetwork: "testnet",
        chainConfig: chainConfig,
        // uiConfig: {
        //     // theme: 'dark',
        //     loginMethodsOrder: ['google', 'facebook']
        // }
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
    useEffect(() => {
        (
            async () => {
                const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)
                const web3auth = new Web3Auth(options);
                web3auth.configureAdapter(openloginAdapter);
                await web3auth.initModal();
                const res = await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig })
                setWeb3authPack(web3AuthModalPack)
                console.log(res)
            }
        )()
    }, [])
    const sign = useCallback(async (message: string) => {
        try {
            const p = web3authPack?.getProvider()
            console.log(p)
            const provider = new ethers.providers.Web3Provider(p)
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

    const login = useCallback(async () => {
        const data = await web3authPack?.signIn()
        console.log({ data })
        if (!data?.eoa) return
        // const signData = await GetDataToSign({ address: data?.eoa, type: "login" })
        setAddress(data?.eoa)
    }, [web3authPack]);
    useEffect(() => {
        async () => {
            const info = await web3authPack?.getUserInfo()
            setAddress(info?.eoa)
            console.log(info)
        }
    }, [web3authPack])
    // const login = () => { console.log(666) }
    return <Web3AuthContext.Provider value={{
        address, login, sign, web3BioRelations, setWeb3BioRelations, relations, setRelations, user, setUser
    }}>{children}</Web3AuthContext.Provider >
}