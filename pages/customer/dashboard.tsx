
import { useCallback, useContext, useEffect } from 'react';
import { customerTotal } from '@/constrants';
import { Albert_Sans } from 'next/font/google';
import CustomerLayout from '@/components/CustomerLayout';
import { Web3AuthContext } from '@/components/Web3AuthContext';
import { useRouter } from 'next/router';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useAccount, useSignMessage } from 'wagmi';
import MyButton from '@/components/MyButton'
import {
    useManageSubscription,
    useSubscription,
    useW3iAccount,
    useInitWeb3InboxClient,
    useMessages
} from '@web3inbox/widget-react'
import { useConnectModal } from "@rainbow-me/rainbowkit";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
// Instantiate and initialize the pack

const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { user } = useContext(Web3AuthContext)
    const { address } = useAccount()
    // const { signMessageAsync } = useSignMessage()
    const router = useRouter()

    // const { openConnectModal } = useConnectModal()
    //
    // // Initialize the Web3Inbox SDK
    // const isReady = true
    const isReady = useInitWeb3InboxClient({
        // The project ID and domain you setup in the Domain Setup section
        projectId: '8e679bafa7f56ef5cbe81fb58f206ff3',
        domain: 'tag-trove.vercel.app',

        // Allow localhost development with "unlimited" mode.
        // This authorizes this dapp to control notification subscriptions for all domains (including `app.example.com`), not just `window.location.host`
        isLimited: false
    })
    //
    const { account, setAccount, isRegistered, isRegistering, register } = useW3iAccount()
    useEffect(() => {
        if (!address) return
        // Convert the address into a CAIP-10 blockchain-agnostic account ID and update the Web3Inbox SDK with it
        setAccount(`eip155:1:${address}`)
    }, [address, setAccount])
    //
    // // In order to authorize the dapp to control subscriptions, the user needs to sign a SIWE message which happens automatically when `register()` is called.
    // // Depending on the configuration of `domain` and `isLimited`, a different message is generated.
    // const performRegistration = useCallback(async () => {
    //     if (!address) return
    //     try {
    //         await register(message => signMessageAsync({ message }))
    //     } catch (registerIdentityError) {
    //         alert(registerIdentityError)
    //     }
    // }, [signMessageAsync, register, address])
    //
    // useEffect(() => {
    //     // Register even if an identity key exists, to account for stale keys
    //     performRegistration()
    // }, [performRegistration])
    //
    const { isSubscribed, isSubscribing, subscribe } = useManageSubscription()
    //
    // const performSubscribe = useCallback(async () => {
    //     // Register again just in case
    //     await performRegistration()
    //     await subscribe()
    // }, [subscribe, isRegistered])
    //
    // const { subscription } = useSubscription()
    const { messages } = useMessages()
    console.log(messages)
    // const messages = [{ "id": 1700361639063, "topic": "bb0e24b151c0519e840dad300a827676863d371f11f3e266330ee29bb1f8c078", "message": { "id": "641de683-2c1e-49b1-b628-3630ab929b4e", "type": "1022b53a-aa1c-400f-afc0-8aee7f67cb78", "title": "Hello world", "body": "I'm your Data2.Cash", "icon": "https://data2.cash/favicon.png", "url": "https://data2.cash" }, "publishedAt": 1700361639000 }, { "id": 1700362187368, "topic": "bb0e24b151c0519e840dad300a827676863d371f11f3e266330ee29bb1f8c078", "message": { "id": "65d3b6ed-04ef-4284-9dcf-398259a76414", "type": "1022b53a-aa1c-400f-afc0-8aee7f67cb78", "title": "Hello world 222", "body": "I'm your Data2.Cash", "icon": "https://data2.cash/favicon.png", "url": "https://data2.cash" }, "publishedAt": 1700362187000 }, { "id": 1700363268865, "topic": "bb0e24b151c0519e840dad300a827676863d371f11f3e266330ee29bb1f8c078", "message": { "id": "31894dec-d391-41ce-9520-dde9921ac46c", "type": "1022b53a-aa1c-400f-afc0-8aee7f67cb78", "title": "0xcaeb...f793", "body": "{\"tag\":\"Github: Solidity Dev & Istanbul: ETH Global Hacker\",\"action\":\"Buy\",\"reward\":0.0525}", "icon": "https://tag-trove.vercel.app/logo-short.png", "url": "https://tag-trove.vercel.app/" }, "publishedAt": 1700363268000 }, { "id": 1700363386091, "topic": "bb0e24b151c0519e840dad300a827676863d371f11f3e266330ee29bb1f8c078", "message": { "id": "e1984db3-6f5c-408b-adca-77c1d0ca57b4", "type": "1022b53a-aa1c-400f-afc0-8aee7f67cb78", "title": "Hello world 222", "body": "I'm your Data2.Cash", "icon": "https://data2.cash/favicon.png", "url": "https://data2.cash" }, "publishedAt": 1700363386000 }]
    const dataUsages = messages.map((m: {
        "id": number,
        "topic": string,
        "message": {
            "id": string,
            "type": string,
            "title": string,
            "body": string,
            "icon": string,
            "url": string
        },
        "publishedAt": number
    }) => {
        try {
            const data = JSON.parse(m.message.body) as { tag: string, app?: string, action?: string, reward?: number }
            return {
                time: new Date(m.publishedAt).toLocaleString(),
                app: m.message.title, ...data
            }
        } catch (error) {
            console.log(error, m.message.body)
            return
        }

    }).filter((value) => typeof value != "undefined")
    const total = dataUsages.reduce((a, b) => a + (b?.reward || 0), 0)
    console.log(dataUsages)
    return <CustomerLayout current='Dashboard' total={customerTotal} hideConnectWallet={true}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start py-10 px-24 ${inter.className} bg-[#fffeff]`}
        >
            <Typography mb={4} variant='h3' fontWeight='600' color={"#008093"}>Dashboard</Typography>

            <div className={clsx('flex  gap-[6px]',
                'w-[1362px]  px-[28px] py-[24px]',
                'bg-white border-[#22222243] border rounded-[24px]',
                'text-[#7c7c7c]')}>

                <div className='flex flex-col justify-between w-[40%]'>
                    <div className='flex rounded-2xl border h-full justify-center items-center'>
                        <img src="/anonymous.svg" className='w-[80%]' alt="" />
                    </div>
                </div>
                <div className='border mx-4'></div>
                <div className='flex flex-col w-[60%]'>
                    <div>
                        <div className='flex justify-between items-center'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>Your AA address:</Typography>
                        </div>
                        <div className='flex text-[20px] justify-between rounded-lg border p-2 mb-[10px]'>
                            <div>{user.mintAddress}</div>
                            <img width={15} height={15} src="/copy.svg" alt="" />
                        </div>
                        <div className='mb-2'>
                            <Typography variant='h6'> <span className='font-bold text-[#008093]'>Balance: </span>{total} USDT</Typography>
                        </div>
                        <div className='flex justify-between items-center mb-5'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>History:</Typography>
                            <MyButton onClick={() => { router.push('/subscribe') }}>Subscribe</MyButton>

                            {/*<MyButton onClick={() => { openConnectModal?.() }}>Subscribe</MyButton>*/}
                        </div>
                        <div className='flex flex-col gap-1 min-h-[300px]'>
                            <div className='flex justify-between text-[#008093] font-bold'>
                                <div className='w-[100px]'>Times</div>
                                <div className='w-[210px]'>Tags</div>
                                <div className='w-[80px]'>App</div>
                                <div className='w-[40px]'>Action</div>
                                <div className='w-[80px]'>Reward</div>
                            </div>
                            <div className='border'></div>
                            {dataUsages.map((value, index) => {
                                return <div key={index} className='flex justify-between border-b'>
                                    <div className='flex items-center w-[100px]'>{value?.time}</div>
                                    <div className='flex items-center w-[210px]'>{value?.tag}</div>
                                    <div className='flex items-center w-[80px]'>{value?.app}</div>
                                    <div className='flex items-center w-[40px]'>{value?.action}</div>
                                    <div className='flex items-center w-[80px]'>${value?.reward?.toFixed(2)}</div>
                                </div>
                            }, [])}
                        </div>
                    </div>
                </div>
            </div>
        </main>

    </CustomerLayout>

}
