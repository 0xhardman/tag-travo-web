"use client";
import { Albert_Sans } from 'next/font/google'
import clsx from 'clsx'
import { useState } from 'react'
import { useContractWrite } from 'wagmi'
import Pay from '@/components/Pay'
import Receive from '@/components/Receive'
import { Tag } from '@/utils/APIs'
import Layout from '@/components/Layout'
import Tip from '@/components/Tip'
import { dataSwapContract } from "@/contracts/dataSwapContract";
import { parseEther } from 'viem'
import { merchantTotal } from '@/constrants';

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Swaper() {
  const [selectTags, setSelectTags] = useState<Tag[]>([])
  const [pay, setPay] = useState('0')

  const { data, isLoading, isSuccess, writeAsync } = useContractWrite({
    ...dataSwapContract as any,
    functionName: 'buy',
  })
  return (
    <Layout current='Swaper' total={merchantTotal}>
      <main
        className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-between p-24 ${inter.className} bg-[#fffeff]`}
      >
        <div className={clsx('flex relative flex-col gap-[6px]',
          'w-[462px]  px-[8px] py-[12px]',
          'bg-white border-[#22222243] border rounded-[24px]',
          'text-[#7c7c7c]')}>
          <Pay pay={pay} setPay={setPay} />
          <div className='left-[200px] top-[120px] rounded-xl absolute flex justify-center items-center box-content bg-[#f9f9f9] border-[4px] border-white w-[32px] h-[32px]'>
            <img src="/down-arrow.svg" alt="" />
          </div>
          <Receive selectTags={selectTags} setSelectTags={setSelectTags} payUSD={Number(pay)} />
          {/* <Tip tag={tag} /> */}
          <div onClick={() => {
            const sorted = selectTags.map((tag) => {
              return tag.id
            }).sort()
            console.log(sorted)
            writeAsync(
              //@ts-ignore
              {
                value: parseEther(pay), args: [sorted],
              })
          }} className='w-full cursor-pointer rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
            Swap
          </div>
        </div>
      </main>
    </Layout>
  )
}
