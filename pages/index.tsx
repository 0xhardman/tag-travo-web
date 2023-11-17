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
import Tip from '@/components/Tip'

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Home() {
  const [pay, setPay] = useState('0')
  const [tag, setTag] = useState<Tag>({
    id: 0,
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
        Hi
      </main>
    </Layout>
  )
}
