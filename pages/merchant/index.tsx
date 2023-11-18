import { Albert_Sans } from 'next/font/google'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { useRouter } from 'next/router'

const inter = Albert_Sans({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/merchant/swaper')
  }, [])
  return (
    <Layout>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className} bg-[#fffeff]`}
      >
        <div></div>
        Welcome to data2swap
      </main>
    </Layout>
  )
}
