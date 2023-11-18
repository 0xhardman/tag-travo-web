import clsx from "clsx"
import { Dispatch, useState, SetStateAction, useEffect, use } from "react"
import { useAccount, useBalance, useEnsAddress } from "wagmi"
import { mainnet } from "wagmi"

export default function Pay({ pay, setPay }: { pay: string, setPay: Dispatch<SetStateAction<string>> }) {
    // const [pay, setPay] = useState('0')
    const { address } = useAccount()
    const [balance, setBalance] = useState('0')
    const { data } = useBalance({
        address: address,
    })
    useEffect(() => {
        setBalance(data?.formatted || '0')
    }, [data])
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
                <img className="w-[20px] h-[20px]" src={'/eth.png'} alt="" />
                <span className='text-[18px] font-semibold text-black'>ETH</span>
            </div>
        </div>
        <div className='flex gap-2 justify-between'>
            <div className='flex gap-2 justify-end'>
                $ {(Number(pay) * 1937).toFixed(4)}
            </div>
            <div className='flex gap-2 justify-end'>
                <div>Balance: {balance}</div>
                <div onClick={() => {
                    setPay(data?.formatted || '0')
                }} className='text-[#1f7f94] font-semibold cursor-pointer'>Max</div>
            </div>
        </div>
    </div>
}