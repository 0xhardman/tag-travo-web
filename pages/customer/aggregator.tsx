import { use, useCallback, useContext, useEffect, useState } from 'react';




import { customerTotal } from '@/constrants';
import { Albert_Sans } from 'next/font/google';
import CustomerLayout from '@/components/CustomerLayout';
import { Web3AuthContext } from '@/components/Web3AuthContext';
import { useRouter } from 'next/router';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BindAddress, GetDataToSign, VerifySign } from '@/utils/APIs';
import { StringUtils } from '@/utils/StringUtils';
// import { signMessage } from 'viem/accounts';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
// Instantiate and initialize the pack

const MyButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return <div onClick={onClick} className='cursor-pointer self-end w-[140px] rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
        {children}
    </div>
}
const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { login, address: AAAddress, relations, web3BioRelations, user } = useContext(Web3AuthContext)
    const [timestamp, setTimestamp] = useState('')
    const [message, setMessage] = useState('')
    const { address } = useAccount()
    const { data: signData, isError, isLoading, isSuccess, signMessage } = useSignMessage({
        message,
        onSuccess: (data) => {
            (async () => {
                console.log(data)
                const res = await BindAddress({ signInfo: { address: address as string, params: { timestamp }, type: 'bind', signature: data } })
                console.log(res)
            })()
        },

    })
    const { openConnectModal, connectModalOpen } = useConnectModal();
    const { disconnect } = useDisconnect()
    const [addresses, setAddresses] = useState([] as string[])
    const router = useRouter()

    const handleAddAddress = async () => {
        disconnect()
        console.log(openConnectModal)
        openConnectModal?.()
    }
    console.log({ relations })

    const data = ["Addr: Uniswap Master", "Addr: Scroll User", "Github: Solidity Dev", "X: FinTech FinTech FinTech", "World Coin human"]
    const tmpAddress = "0xb15115A15d5992A756D003AE74C0b832918fAb75"
    return <CustomerLayout current='Aggregator' total={customerTotal} hideConnectWallet={false}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start py-10 px-24 ${inter.className} bg-[#fffeff]`}
        >
            <Typography mb={3} variant='h3' fontWeight='600' color={"#008093"}>Aggregator</Typography>
            <div className={clsx('flex  gap-[6px]',
                'w-[1362px]  px-[28px] py-[24px]',
                'bg-white border-[#22222243] border rounded-[24px]',
                'text-[#7c7c7c]')}>
                <div className='flex flex-col w-[50%]'>
                    <div>
                        <div className='flex justify-between items-center'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>Your AA address:</Typography>
                        </div>
                        <div className='flex text-[20px] justify-between rounded-lg border p-2 mb-[10px]'>
                            <div>{AAAddress || tmpAddress}</div>
                            <img width={15} height={15} src="/copy.svg" alt="" />
                        </div>
                        <div className='flex justify-between items-center'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>Web3 Address:</Typography>
                            <MyButton onClick={() => { handleAddAddress() }}>
                                Add <img className='ml-4 rotate-45 w-[12px]' src="/cross.svg" alt="" />
                            </MyButton>
                        </div>
                        <div className='flex flex-wrap justify-start gap-x-5 gap-y-2 py-4'>
                            {relations.map((value, index) => {
                                return <div key={index} className='flex text-[20px] justify-between rounded-lg border w-[180px] p-2'>
                                    <div>{value.id.slice(0, 5)}...{value.id.slice(-5)}</div>
                                    <img width={15} height={15} src="/copy.svg" alt="" />
                                </div>
                            })}

                        </div>
                        <div className='flex justify-between items-center py-2 mt-2'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>Associate Web2 Account:</Typography>
                        </div>
                        <div className='flex flex-wrap justify-start gap-x-5 gap-y-2 py-4'>
                            {[
                                { type: 'twitter', value: "0xhardman" },
                                { type: 'github', value: "0xhardman" }
                            ].map((value, index) => {
                                return <div key={index} className='flex justify-between px-4 py-2 gap-2 border rounded-md'>
                                    {value.type == "twitter" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#029ee5]'><img width={30} height={30} className='' src="/twitter.svg" alt="" /></div>}
                                    {value.type == "github" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#000]'><img width={30} height={30} className='' src="/github.svg" alt="" /></div>}
                                    <div>
                                        <div className='font-bold capitalize text-black'>{value.type}</div>
                                        <div>{value.value}</div>
                                    </div>
                                </div>
                            })}

                        </div>
                    </div>
                    <div className='border'></div>
                    <div>
                        <div className='flex justify-between items-center mt-8'>
                            <Typography variant='h4' fontWeight='600' color={"#008093"}>Exported Data:</Typography>
                        </div>
                        <div className='flex  flex-wrap justify-start gap-x-5 gap-y-2 py-4'>
                            <div className='flex flex-col w-[180px] justify-between items-start p-6 gap-2 border rounded-md overflow-hidden'>
                                <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-black' style={{
                                    boxShadow: '-10px -10px 80px  #000000',

                                }}><img width={30} height={30} className='' src="/worldcoin.svg" alt="" /></div>
                                <div>
                                    <div className='font-bold capitalize text-black'>World Coin</div>
                                    <div className='border text-center mt-4 px-2 py-1 text-white bg-black rounded-lg'>Verify</div>
                                </div>
                            </div>
                            <div className='flex flex-col w-[180px] justify-between items-start p-6 gap-2 border rounded-md overflow-hidden'>
                                <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#00a2e1]' style={{
                                    boxShadow: '-10px -10px 80px  #00a2e1',

                                }}><img width={30} height={30} className='' src="/twitter.svg" alt="" /></div>
                                <div>
                                    <div className='font-bold capitalize text-black'>Wold Coin</div>
                                    <div className='border text-center mt-4 px-2 py-1 text-white bg-[#00a2e1] rounded-lg'>Upload</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div className='border mx-4'></div>
                <div className='flex flex-col justify-between w-[40%]'>
                    <div className='flex flex-wrap justify-start gap-x-3 gap-y-2'>
                        {
                            data.map((value, index) => {
                                return <div key={index} className='relative border flex justify-between items-center py-2 px-4 text-[30px] text-black rounded-lg'>
                                    {value}
                                    <div className='absolute flex justify-center text-white  rounded-full items-center  -top-[6px] -right-[6px] w-[20px] h-[20px] bg-[#008093]'>
                                        <img width={10} height={10} src="/cross.svg" alt="" />
                                    </div>

                                </div>
                            })
                        }
                    </div>
                    <MyButton onClick={() => { }}>
                        Encrypt
                    </MyButton>
                </div>
            </div>
        </main>
        {/* <Grid container spacing={2}>
                <Grid item xs={7} sx={{
                    // bgcolor: 'blue',
                }}>
                    <Box >132</Box>
                </Grid>
                <Grid item alignItems="center" justifyContent="center" xs={5} sx={{
                    borderLeft: '1px solid green',
                    // bgcolor: 'green',
                }}>
                    <Grid container spacing={6}>
                        {["Addr: Uniswap Master", "Addr: Scroll User", "Github: Solidity Dev", "X: FinTech FinTech FinTech", "World Coin human"].map((value, index) => {
                            return <Grid key={index} xs={5} sx={{
                                display: 'flex',
                                textAlign: 'center',
                                border: '1px solid red',

                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>{value}</Grid>

                        })}

                    </Grid>
                </Grid>

            </Grid> */}

        {/* <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start p-24 ${inter.className} bg-[#fffeff]`}
        >
            Your AA address: {address}
        </main> */}
    </CustomerLayout>

}