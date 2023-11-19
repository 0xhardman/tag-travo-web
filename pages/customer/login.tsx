import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { useCallback, useContext, useEffect, useState } from 'react';

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
const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)

const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { handleSign, aaSignIn, address } = useContext(Web3AuthContext)
    const router = useRouter()

    const handleClear = () => {
        localStorage.clear();
        window.location.reload()
    }

    return <CustomerLayout current='Login' total={customerTotal} hideConnectWallet={true}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start p-24 ${inter.className} bg-[#fffeff]`}
        >

            <div className='flex flex-col justify-center items-center gap-2'>
                <Typography variant='h1' fontWeight={600} color="#008192">Welcome!</Typography>
                <Typography align='center' variant='h5' color="gray" mb={2}>Sign in with your Google account, email or Web3 address. </Typography>
                <Typography variant='h4' fontWeight={600} color="#008192">{address}</Typography>
                <Button onClick={() => { aaSignIn() }} fullWidth variant='outlined' size='large'>Login with SAFE AA Auth Kit</Button>
                <Button onClick={() => { handleSign() }} fullWidth variant='outlined' size='large'>Sign In</Button>
                <Button onClick={() => {
                    handleClear()
                }} fullWidth variant='outlined' size='large'>Clear LocalStorage</Button>

            </div>
        </main>
    </CustomerLayout>

}
