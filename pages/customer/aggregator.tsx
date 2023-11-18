import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { use, useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import Layout from '@/components/Layout';
import { customerTotal } from '@/constrants';
import { Albert_Sans } from 'next/font/google';
import { Button, Typography } from '@mui/material';
import CustomerLayout from '@/components/CustomerLayout';
import { Web3AuthContext } from '@/components/Web3AuthContext';
import { useRouter } from 'next/router';
const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-goerli.safe.global'
}

// Instantiate and initialize the pack

const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { login, address } = useContext(Web3AuthContext)
    const router = useRouter()
    useEffect(() => {
        console.log({ address })
        if (!address) {
            localStorage.clear();
            router.push('login')
            return
        }
        // router.push('aggregate')
    }, [address])
    return <CustomerLayout current='Aggregator' total={customerTotal} hideConnectWallet={true}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start p-24 ${inter.className} bg-[#fffeff]`}
        >
            Your AA address: {address}
        </main>
    </CustomerLayout>

}