import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter, CommenKeyPrivider } from '@web3auth/openlogin-adapter'
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-goerli.safe.global'
}

// Instantiate and initialize the pack
const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)

export default function Test() {
    const [donation, setDonation] = useState(0);
    const clientId =
        process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ??
        "BOZ_Bpk52QEjIZheU6fcq3e8ZGsHaoJizs7vbT5HPJN9cITsnR6ky2CFV3jvor_yKt42wk44sNYmPdXSfKhcSow";
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
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
        rpcTarget: "https://rpc.ankr.com/eth",
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
                const web3auth = new Web3Auth(options);
                web3auth.configureAdapter(openloginAdapter);
                await web3auth.initModal();
                const res = await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig })
                console.log(res)

            }
        )()
    }, [])
    const sign = useCallback(async () => {
        try {
            const p = web3AuthModalPack.getProvider()
            console.log(p)
            const provider = new ethers.providers.Web3Provider(p)
            const signer = await provider.getSigner()
            const message = 'hello world'
            const address = '0x7FD69E691F8b8f7Fa416CDCaFD41eDB32E0Eb3c8'
            const res = await signer.signMessage(message)
            console.log(res)
        } catch (error) {
            console.log(error)
        }

    }, [provider])
    const login = async () => {


        const data = await web3AuthModalPack.signIn()

        console.log("hi~", data);

    };
    return <div>
        <p>Test</p>
        <button onClick={() => { login() }}>handleLogin</button>
        <br />
        <button onClick={() => { sign() }}>sign</button>
    </div>
}