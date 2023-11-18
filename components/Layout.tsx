import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Navigator } from "@/type";
import clsx from "clsx";

export default function Layout({ children, current, total, hideConnectWallet = false }: { children: React.ReactNode, current?: string, total?: Navigator[], hideConnectWallet?: boolean }) {
    const router = useRouter()
    // const [current, setCurrent] = useState<'swaper' | 'sender'>('swaper')
    // useEffect(() => {
    //     router.asPath.includes('swaper') && setCurrent('swaper')
    //     router.asPath.includes('sender') && setCurrent('sender')
    // }, [router])
    return <div className=''>
        <div className='flex justify-between items-center w-screen h-[70px] border-b px-[20px]'>
            <div className='flex gap-4 items-center'>
                <div className='flex gap-2'>
                    <img className='w-[30px]' src="/logo-short.svg" alt="" />
                    <div className='text-[20px] text-[#008192] font-bold'>Data2Swap</div>
                </div>
            </div>
            <div className='flex justify-spacing items-center gap-8 text-[#7d7d7d]'>
                {total?.map((value, index) => {
                    return <div key={index} onClick={
                        () => router.push(value.path)
                    } className={`cursor-pointer ${current == value.name ? 'text-[#008192]' : ''}`}>{value.name}</div>
                })}

                {/* <div onClick={
                    () => router.push('/sender')
                } className={`cursor-pointer ${current == 'sender' ? 'text-[#008192]' : ''}`}
                >Sender</div> */}
            </div>
            <div className={clsx(hideConnectWallet ? "opacity-0" : "opacity-100")}>
                <ConnectButton showBalance={false} chainStatus="icon" />
            </div>

            {/* <div className='w-[120px]'></div> */}
        </div>
        {children}
    </div>
}