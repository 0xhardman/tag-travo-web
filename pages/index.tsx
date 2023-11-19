import { Albert_Sans } from 'next/font/google'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { useRouter } from 'next/router'
import { Typography } from '@mui/material'

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()
  return (
    <Layout hideConnectWallet>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className} bg-[#fffeff]`}
      >
        <div className='flex gap-8'>
          <div onClick={() => { router.push('/merchant') }} className='flex cursor-pointer flex-col border-[4px] border-[#008291] rounded-3xl p-4 w-[400px] h-[400px] gap-[20px]'>
            <div className='w-[160px] h-[160px]'>
              <img src="merchant.svg" width={160} height={160} alt="" />
            </div>
            <Typography variant='h2' fontWeight={600} color="#008192">Merchant</Typography>
            <Typography variant='body1' fontSize={"20px"} color="#008192">Buy credits to send personalized messages to specific user groups.</Typography>
          </div>
          <div onClick={() => { router.push('/customer') }} className='flex cursor-pointer flex-col border-[4px] border-[#008291] rounded-3xl p-4 w-[400px] h-[400px] gap-[20px]'>
            <div className='w-[160px] h-[160px]'>
              <img src="customer.svg" width={140} height={140} alt="" />
            </div>
            <Typography variant='h2' fontWeight={600} color="#008192">Customer</Typography>
            <Typography variant='body1' fontSize={"20px"} color="#008192">Log in, upload your Web2 and Web3 data and earn by receiving messages.</Typography>
          </div>
        </div>

      </main>
    </Layout>
  )
}
