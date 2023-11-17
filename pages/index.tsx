import Image from 'next/image'
import { Albert_Sans } from 'next/font/google'
import clsx from 'clsx'
import Arrow from '@/components/Arrow'
import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Pay from '@/components/Pay'
import Receive from '@/components/Receive'
import { Tag } from '@/type'
import Layout from '@/components/Layout'

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Home() {
  const [pay, setPay] = useState('0')
  const [tag, setTag] = useState<Tag>({
    tag: '',
    description: 'Frozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurt',
    count: 1,
    price: 0.01,
  })
  return (
    <Layout>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className} bg-[#fffeff]`}
      >
        <div className={clsx('flex relative flex-col gap-[6px]',
          'w-[462px]  px-[8px] py-[12px]',
          'bg-white border-[#22222243] border rounded-[24px]',
          'text-[#7c7c7c]')}>
          <Pay pay={pay} setPay={setPay} />
          <div className='left-[200px] top-[120px] rounded-xl absolute flex justify-center items-center box-content bg-[#f9f9f9] border-[4px] border-white w-[32px] h-[32px]'>
            <img src="/down-arrow.svg" alt="" />
          </div>
          <Receive tag={tag} setTag={setTag} payUSD={Number(pay)} />
          <div className={clsx('flex justify-center',
            'h-[50px] p-[16px]',
            'bg-white rounded-[16px] border border-[#22222213]',
            'text-[14px] text-[#7c7c7c]'
          )}>
            <div className='text-black'>
              1 BNB can send {tag.count} users with <span className='border bg-[#008093] p-[4px] rounded-lg text-white'>{tag?.tag}</span> {(1 / tag.price).toFixed(0)} times mails.
            </div>
            {/* <div className='flex items-center'>
              <img className='w-[18px] mr-[4px] opacity-40 ' src="/gas.svg" alt="" />
              <div>$0.23</div>
              <Arrow color="#cecece" />
            </div> */}
          </div>
          <div className='w-full rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
            Swap
          </div>
        </div>
      </main>
    </Layout>
  )
}
