import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { LayoutNavigator } from "@/type";
import clsx from "clsx";

export default function Layout({ children, current, total, hideConnectWallet = false }: { children: React.ReactNode, current?: string, total?: LayoutNavigator[], hideConnectWallet?: boolean }) {
    const router = useRouter()
    // const [current, setCurrent] = useState<'swaper' | 'sender'>('swaper')
    // useEffect(() => {
    //     router.asPath.includes('swaper') && setCurrent('swaper')
    //     router.asPath.includes('sender') && setCurrent('sender')
    // }, [router])
    return <div className=''>
        <div className='flex justify-between items-center w-screen h-[70px] border-b px-[20px]'>
            <div onClick={() => {
                router.push('/')
            }} className='flex gap-4 items-center cursor-pointer'>
                <div className='flex gap-2 items-center'>
                    <img className='w-[50px]' src="/logo-short.png" alt="" />
                    <div className='text-[20px] text-[#008192] font-bold'>TagTrove</div>
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