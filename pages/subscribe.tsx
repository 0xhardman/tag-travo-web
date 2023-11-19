import Layout from '@/components/Layout'
import {
    useManageSubscription,
    useSubscription,
    useW3iAccount,
    useInitWeb3InboxClient,
    useMessages
} from '@web3inbox/widget-react'
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Albert_Sans } from 'next/font/google'
import { useCallback, useEffect } from 'react'
import { useSignMessage, useAccount } from 'wagmi'
import MyButton from '@/components/MyButton';

const inter = Albert_Sans({ subsets: ['latin'] })
function TextDecoration({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
    return <div onClick={onClick} className='text-[48px] font-bold text-[#008291]'>{children}</div>
}
export default function App() {
    const { address } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const { openConnectModal } = useConnectModal()

    // Initialize the Web3Inbox SDK
    const isReady = true
    // const isReady = useInitWeb3InboxClient({
    //     // The project ID and domain you setup in the Domain Setup section
    //     projectId: '8e679bafa7f56ef5cbe81fb58f206ff3',
    //     domain: 'tag-trove.vercel.app',

    //     // Allow localhost development with "unlimited" mode.
    //     // This authorizes this dapp to control notification subscriptions for all domains (including `app.example.com`), not just `window.location.host`
    //     isLimited: false
    // })

    const { account, setAccount, isRegistered, isRegistering, register } = useW3iAccount()
    useEffect(() => {
        if (!address) return
        // Convert the address into a CAIP-10 blockchain-agnostic account ID and update the Web3Inbox SDK with it
        setAccount(`eip155:1:${address}`)
    }, [address, setAccount])

    // In order to authorize the dapp to control subscriptions, the user needs to sign a SIWE message which happens automatically when `register()` is called.
    // Depending on the configuration of `domain` and `isLimited`, a different message is generated.
    const performRegistration = useCallback(async () => {
        if (!address) return
        try {
            await register(message => signMessageAsync({ message }))
        } catch (registerIdentityError) {
            alert(registerIdentityError)
        }
    }, [signMessageAsync, register, address])

    useEffect(() => {
        // Register even if an identity key exists, to account for stale keys
        performRegistration()
    }, [performRegistration])

    const { isSubscribed, isSubscribing, subscribe } = useManageSubscription()

    const performSubscribe = useCallback(async () => {
        // Register again just in case
        await performRegistration()
        await subscribe()
    }, [subscribe, isRegistered])

    const { subscription } = useSubscription()
    const { messages } = useMessages()

    return (
        <Layout>
            <main
                className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start py-10 px-24 ${inter.className} bg-[#fffeff]`}
            >
                {!isReady ? (
                    <TextDecoration>Loading client...</TextDecoration>
                ) : (
                    <>
                        {!address ? (
                            <TextDecoration onClick={() => { openConnectModal?.() }}>Connect your wallet</TextDecoration>
                        ) : (
                            <>
                                <div>Address: {address}</div>
                                <div>Account ID: {account}</div>
                                {!isRegistered ? (
                                    <div className='flex flex-col items-center justify-center'>
                                        To manage notifications, sign and register an identity key:&nbsp;
                                        <button disabled={!isRegistering} className='cursor-pointer w-[140px] rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center mt-4'>
                                            {isRegistering ? 'Signing...' : 'Sign'}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {!isSubscribed ? (
                                            <>
                                                <button onClick={performSubscribe} disabled={isSubscribing} className='cursor-pointer w-[140px] rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center mt-4'>
                                                    {isSubscribing ? 'Subscribing...' : 'Subscribe to notifications'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div>You are subscribed</div>
                                                <div>Subscription: {JSON.stringify(subscription)}</div>
                                                <div>Messages: {JSON.stringify(messages)}</div>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </Layout>
    )
}