
import { useContext } from 'react';
import { customerTotal } from '@/constrants';
import { Albert_Sans } from 'next/font/google';
import CustomerLayout from '@/components/CustomerLayout';
import { Web3AuthContext } from '@/components/Web3AuthContext';
import { useRouter } from 'next/router';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useAccount, useSignMessage } from 'wagmi';
import MyButton from '@/components/MyButton'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
// Instantiate and initialize the pack

const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { user } = useContext(Web3AuthContext)
    const { address } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const router = useRouter()


    return <CustomerLayout current='Dashboard' total={customerTotal} hideConnectWallet={true}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start py-10 px-24 ${inter.className} bg-[#fffeff]`}
        >
            <Typography mb={4} variant='h3' fontWeight='600' color={"#008093"}>Dashboard</Typography>

            <div className={clsx('flex  gap-[6px]',
                'w-[1362px]  px-[28px] py-[24px]',
                'bg-white border-[#22222243] border rounded-[24px]',
                'text-[#7c7c7c]')}>

                <div className='flex flex-col justify-between w-[40%]'>
                    <div className='flex rounded-2xl border h-full justify-center items-center'>
                        <img src="/anonymous.svg" className='w-[80%]' alt="" />
                    </div>
                </div>
                <div className='border mx-4'></div>
                <div className='flex flex-col w-[60%]'>
                    <div>
                        <div className='flex justify-between items-center'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>Your AA address:</Typography>
                        </div>
                        <div className='flex text-[20px] justify-between rounded-lg border p-2 mb-[10px]'>
                            <div>{user.mintAddress}</div>
                            <img width={15} height={15} src="/copy.svg" alt="" />
                        </div>
                        <div className='mb-2'>
                            <Typography variant='h6'> <span className='font-bold text-[#008093]'>Balance: </span>{(0).toFixed(2)} USDT</Typography>
                        </div>
                        <div className='flex justify-between items-center mb-5'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>History:</Typography>
                            <MyButton onClick={() => {router.push('/subscribe') }}>Subscribe</MyButton>
                        </div>
                        <div className='flex flex-col gap-1 min-h-[300px]'>
                            <div className='flex justify-between text-[#008093] font-bold'>
                                <div className='w-[140px]'>Times</div>
                                <div className='w-[80px]'>Tags</div>
                                <div className='w-[80px]'>App</div>
                                <div className='w-[80px]'>Action</div>
                                <div className='w-[80px]'>Reward</div>
                            </div>
                            <div className='border'></div>
                            {[{ time: "2022/11/11 22:22:12", tag: "all", app: "data2cash", action: "onboard", raward: '$1.0' }].map((value, index) => {
                                return <div key={index} className='flex justify-between'>
                                    <div className='flex items-center w-[140px]'>{value.time}</div>
                                    <div className='flex items-center w-[80px]'>{value.tag}</div>
                                    <div className='flex items-center w-[80px]'>{value.app}</div>
                                    <div className='flex items-center w-[80px]'>{value.action}</div>
                                    <div className='flex items-center w-[80px]'>{value.raward}</div>
                                </div>
                            }, [])}
                        </div>
                    </div>
                </div>
            </div>
        </main>

    </CustomerLayout>

}