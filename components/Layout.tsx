import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [current, setCurrent] = useState<'swaper' | 'sender'>('swaper')
    useEffect(() => {
        router.asPath.includes('swaper') && setCurrent('swaper')
        router.asPath.includes('sender') && setCurrent('sender')
    }, [router])
    return <div className=''>
        <div className='flex justify-between items-center w-screen h-[70px] border-b px-[20px]'>
            <div className='flex gap-4 items-center'>
                <div className='flex gap-2'>
                    <img className='w-[30px]' src="/logo-short.svg" alt="" />
                    <div className='text-[20px] text-[#008192] font-bold'>Data2Swap</div>
                </div>
            </div>
            <div className='flex justify-spacing items-center gap-8 text-[#7d7d7d]'>
                <div onClick={
                    () => router.push('/swaper')
                } className={`cursor-pointer ${current == 'swaper' ? 'text-[#008192]' : ''}`}>Swaper</div>
                <div onClick={
                    () => router.push('/sender')
                } className={`cursor-pointer ${current == 'sender' ? 'text-[#008192]' : ''}`}
                >Sender</div>
            </div>
            <ConnectButton showBalance={false} chainStatus="icon" />
            {/* <div className='w-[120px]'></div> */}
        </div>
        {children}
    </div>
}