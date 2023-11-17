import Image from 'next/image'
import { Albert_Sans } from 'next/font/google'
import clsx from 'clsx'
import Arrow from '@/components/Arrow'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Pay from '@/components/Pay'
import Receive from '@/components/Receive'
import { Tag } from '@/type'
import Layout from '@/components/Layout'
import Tip from '@/components/Tip'
import { useRouter } from 'next/router'

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/swaper')
  }, [])
  return (
    <Layout>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className} bg-[#fffeff]`}
      >

      </main>
    </Layout>
  )
}
