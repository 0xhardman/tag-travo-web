import clsx from "clsx"
import { useState } from "react"
import { useAccount, useBalance, useEnsAddress } from "wagmi"

export default function Pay({ }) {
    const [pay, setPay] = useState('0')
    const { address } = useAccount()
    const { data } = useBalance({
        address: address,
    })
    console.log(pay)
    return <div className={clsx('flex flex-col',
        'h-[12opx] p-[16px]',
        'bg-[#f9f9f9] rounded-[16px]',
        'text-[14px] '
    )}>
        <div>You pay</div>
        <div className='flex justify-between items-center'>
            <div className='text-[36px]'><input className='w-full bg-[#f9f9f9] outline-none' type="text" value={pay} onChange={(e) => {
                // console.log(Number(e.target.value) || 0)
                setPay(e.target.value)
            }} /></div>
            <div className='px-[4px] flex justify-start items-center shadow-md border border-[#22222222] gap-2 w-[107px] h-[34px] bg-white rounded-full'>
                <img src="/bnb.svg" alt="" />
                <span className='text-[18px] font-semibold text-black'>BNB</span>
            </div>
        </div>
        <div className='flex gap-2 justify-between'>
            <div className='flex gap-2 justify-end'>
                $ {(Number(pay) * 252).toFixed(4)}
            </div>
            <div className='flex gap-2 justify-end'>
                <div>Balance: {data?.formatted}</div>
                <div onClick={() => {
                    console.log(data)
                    setPay(data?.formatted || '0')
                }} className='text-[#1f7f94] font-semibold cursor-pointer'>Max</div>
            </div>
        </div>
    </div>
}