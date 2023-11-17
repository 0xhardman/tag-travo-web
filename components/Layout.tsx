import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <div className=''>
        <div className='flex justify-between items-center w-screen h-[70px] border-b px-[20px]'>
            <div className='flex gap-4 items-center'>
                <div className='flex gap-2'>
                    <img className='w-[30px]' src="/logo-short.svg" alt="" />
                    <div className='text-[20px] text-[#008192] font-bold'>Data2Swap</div>
                </div>
            </div>
            <div className='flex justify-spacing items-center gap-8 text-[#7d7d7d]'>
                <div>Intro</div>
                <div>Swaper</div>
                <div>Sender</div>
            </div>
            <ConnectButton showBalance={false} chainStatus="icon" />
            {/* <div className='w-[120px]'></div> */}
        </div>
        {children}
    </div>
}