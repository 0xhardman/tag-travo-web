import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { use, useCallback, useContext, useEffect, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { customerTotal } from '@/constrants';
import { Albert_Sans } from 'next/font/google';
import { Button, Typography } from '@mui/material';
import CustomerLayout from '@/components/CustomerLayout';
import { Web3AuthContext } from '@/components/Web3AuthContext';
import { useRouter } from 'next/router';
import { GetDataToSign, Login, VerifySign } from '@/utils/APIs';
import { sign } from 'crypto';
import { StringUtils } from '@/utils/StringUtils';
import { set } from 'react-hook-form';
import { setupToken } from '@/utils/AuthUtils';
const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-goerli.safe.global'
}

// Instantiate and initialize the pack
const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)

const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { login, address, sign, setRelations, setUser, setWeb3BioRelations } = useContext(Web3AuthContext)
    const [message, setMessage] = useState('')
    const [timestamp, setTimestamp] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const handleSign = async () => {
        console.log(111, { address })
        let data = await GetDataToSign({ address, type: 'login' });
        const timestamp = Date.now().toString();
        setTimestamp(timestamp)
        console.log(timestamp)
        const res = StringUtils.fillData2Str(data.data, { timestamp: timestamp }, false)

        setMessage(res)
    }
    const handleSignConfirm = async () => {
        const signature = await sign(message)
        if (signature == "error") {
            console.log("sig error")
        }
        const { key } = await VerifySign({ address, params: { timestamp }, type: 'login', signature })
        setupToken(key, 'login', true)
        console.log(key)
        const userRelations = await Login({})
        console.log(userRelations)
        setRelations(userRelations.relations)
        setUser(userRelations.user)
        setWeb3BioRelations(userRelations.web3BioRelations)

        router.push('aggregator')

    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClear = () => {
        localStorage.clear();
        window.location.reload()
    }

    const handleClose = () => {
        setOpen(false);
    };
    useEffect(() => {
        if (!message) {
            return
        }
        setOpen(true)
    }, [message])
    // useEffect(() => {
    //     console.log({ address })
    //     if (!address) {
    //         return
    //     }
    //     router.push('aggregator')
    // }, [address])
    return <CustomerLayout current='Login' total={customerTotal} hideConnectWallet={true}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start p-24 ${inter.className} bg-[#fffeff]`}
        >
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
            <div>
                <Typography variant='h1' fontWeight={600} color="#008192">Hi Anon!</Typography>
                <Button onClick={() => { login() }} fullWidth variant='outlined' size='large'>Login with AA</Button>
                <Typography variant='h4' fontWeight={600} color="#008192">{address}</Typography>
                <Button onClick={() => { handleSign() }} fullWidth variant='outlined' size='large'>Sign In</Button>
                <Button onClick={() => {
                    handleClear()
                }} fullWidth variant='outlined' size='large'>Clear</Button>

            </div>
        </main>
    </CustomerLayout>

}
