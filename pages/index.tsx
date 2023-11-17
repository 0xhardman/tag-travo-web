import Image from 'next/image'
import { Albert_Sans } from 'next/font/google'
import clsx from 'clsx'
import Arrow from '@/components/Arrow'
import { useState } from 'react'

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Home() {
  const [pay, setPay] = useState(0)
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className} bg-[#fffeff]`}
    >
      <div className={clsx('flex relative flex-col gap-[6px]',
        'w-[462px]  px-[8px] py-[12px]',
        'bg-white border-[#22222243] border rounded-[24px]',
        'text-[#7c7c7c]')}>
        <div className={clsx('flex flex-col',
          'h-[12opx] p-[16px]',
          'bg-[#f9f9f9] rounded-[16px]',
          'text-[14px] '
        )}>
          <div>You pay</div>
          <div className='flex justify-between items-center'>
            <div className='text-[36px]'><input className='w-full bg-[#f9f9f9] outline-none' type="text" value={pay} onChange={(e) => { setPay(e.value) }} /></div>
            <div className='px-[4px] flex justify-start items-center shadow-md border border-[#22222222] gap-1 w-[107px] h-[34px] bg-white rounded-full'>
              <div className='w-[24px] h-[24px] bg-[#f7ce46] rounded-full mr-[4px]'></div>
              <span className='text-[18px] font-semibold text-black'>BNB</span>
              {/* <div>^</div> */}
              <Arrow color='black' />
            </div>

          </div>
          <div className='flex gap-2 justify-between'>
            <div className='flex gap-2 justify-end'>
              $ 123
            </div>
            <div className='flex gap-2 justify-end'>
              <div>Balance: 0.2123</div>
              <div className='text-[##1f7f94] font-semibold'>Max</div>
            </div>
          </div>
        </div>
        <div className='left-[200px] top-[120px] rounded-xl absolute flex justify-center items-center box-content bg-[#f9f9f9] border-[4px] border-white w-[32px] h-[32px]'>
          <img src="/down-arrow.svg" alt="" />
        </div>
        <div className={clsx('flex flex-col',
          'h-[12opx] p-[16px]',
          'bg-[#f9f9f9] rounded-[16px]',
          'text-[14px] text-[#7c7c7c]'
        )}>
          <div>You Receive</div>
          <div className='flex justify-between items-center'>
            <div className='text-[36px]'>0</div>
            <div className='px-[12px] flex justify-start items-center shadow-md bg-[#1f7f94] text-white gap-1  h-[34px] rounded-full text-[20px]'>
              Select data
              <Arrow color="white" />
            </div>

          </div>
          <div className='flex gap-2 justify-between'>
            <div className='flex gap-2 justify-end'>
              $ 123
            </div>
            <div className='flex gap-2 justify-end'>
              <div>Balance: 0.2123</div>
            </div>
          </div>
        </div>
        <div className={clsx('flex justify-between',
          'h-[50px] p-[16px]',
          'bg-white rounded-[16px] border border-[#22222213]',
          'text-[14px] text-[#7c7c7c]'
        )}>
          <div className='text-black'>
            1 USDT=0.00048 BNB
            <span className='text-[#7c7c7c]'>($1.00)</span>
          </div>
          <div className='flex items-center'>
            <img className='w-[18px] mr-[4px] opacity-40 ' src="/gas.svg" alt="" />
            <div>$0.23</div>
            <Arrow color="#cecece" />
            {/* <img className='w-[24px] mr-[4px]' src="/arrow.svg" alt="" /> */}
          </div>
        </div>
        <div className='w-full rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
          Swap
        </div>
      </div>

    </main>
  )
}
