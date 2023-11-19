import { use, useCallback, useContext, useEffect, useState } from 'react';
import { IDKitWidget } from "@worldcoin/idkit";
import FileUploader from '@/components/FileUploader';
import { customerTotal } from '@/constrants';
import { Albert_Sans } from 'next/font/google';
import CustomerLayout from '@/components/CustomerLayout';
import { Web3AuthContext } from '@/components/Web3AuthContext';
import { useRouter } from 'next/router';
import { Box, Container, Grid, Paper, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, dividerClasses, } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BindAddress, GetDataToSign, Tag, VerifySign } from '@/utils/APIs';
import { StringUtils } from '@/utils/StringUtils';
import MyButton from '@/components/MyButton'
// import { signMessage } from 'viem/accounts';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
// Instantiate and initialize the pack

// const MyButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
//     return <div onClick={onClick} className='cursor-pointer self-end w-[140px] rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
//         {children}
//     </div>
// }
const inter = Albert_Sans({ subsets: ['latin'] })
export default function Test() {
    const { handleSign } = useContext(Web3AuthContext)
    const { tags, setTags, address: AAAddress, relations, setRelations, web3BioRelations, setWeb3BioRelations, user } = useContext(Web3AuthContext)
    const [timestamp, setTimestamp] = useState('')
    const [message, setMessage] = useState('')
    const { address } = useAccount()
    const [fileName, setFileName] = useState("");
    const handleFile = (file) => {
        console.log("handleFile", file)
        if (!file) return;
        setFileName(file?.name);
    };
    const { data: signData, isError, isLoading, isSuccess, signMessage } = useSignMessage({
        message,
        onSuccess: (data) => {
            (async () => {
                console.log(data)
                const res = await BindAddress({ signInfo: { address: address as string, params: { timestamp }, type: 'bind', signature: data } })
                setRelations([...relations, res.relation])
                const tmp = [...web3BioRelations, ...res.web3BioRelations]
                let idSet = new Set();
                let uniqueArr = [];

                for (let obj of tmp) {
                    if (!idSet.has(obj.id)) {
                        uniqueArr.push(obj);
                        idSet.add(obj.id);
                    }
                }
                setWeb3BioRelations(uniqueArr)
                console.log(res)
            })()
        },
    })
    const { openConnectModal, connectModalOpen } = useConnectModal();
    const [open, setOpen] = useState(false)
    const { disconnect } = useDisconnect()
    const router = useRouter()

    const handleAddAddress = async () => {
        if (address) {
            setOpen(true)
        }
        openConnectModal?.()
    }
    const handleConfirmDisconnect = () => {
        disconnect()
        setOpen(false)
    }

    const handleClose = () => {
        setOpen(false);
    };
    useEffect(() => {
        (async () => {
            if (Object.keys(user).length == 0) return
            if (!address) return
            if (relations.map((v, i) => v.id).includes(address)) {
                console.log("Already added")
                return
            }
            let data = await GetDataToSign({ address, type: 'bind' });
            const timestamp = Date.now().toString();
            const res = StringUtils.fillData2Str(data.data, { timestamp: timestamp }, false)
            console.log(res)
            const signature = await signMessage({ message: res })
            console.log({ signature, signData })
            // setMessage(res)
            setTimestamp(timestamp)
        })()
    }, [address])
    useEffect(() => {
        if (fileName == "") return
        setTags([...tags, {
            addressesRoot: "",
            curator: "",
            dataPower: 100,
            description: "Twitter User",
            id: "13321",
            name: "X: FinTech",
            // rules: "Twitter User",
            /**
             * "Active" | "Hidden"
             */
            state: "Active",
            zkEnable: true,
        } as any])
    }, [fileName])
    const data = ["Addr: Uniswap Master", "Addr: Scroll User", "Github: Solidity Dev", "X: FinTech FinTech FinTech", "World Coin human"]
    return <CustomerLayout current='Aggregator' total={customerTotal} hideConnectWallet={false}>
        <main
            className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start py-10 px-24 ${inter.className} bg-[#fffeff]`}
        >
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    ATTENTION
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Please disconnect your current account before adding a new one.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleConfirmDisconnect} autoFocus>
                        Disconnect
                    </Button>
                </DialogActions>
            </Dialog>
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
                            <div>{user.mintAddress}</div>
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
                            {web3BioRelations.map((value, index) => {
                                return <div key={index} className='flex justify-between px-4 py-2 gap-2 border rounded-md'>
                                    {value.platform == "twitter" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#029ee5]'><img width={30} height={30} className='' src="/twitter.svg" alt="" /></div>}
                                    {value.platform == "github" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#000]'><img width={30} height={30} className='' src="/github.svg" alt="" /></div>}
                                    {value.platform == "discord" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#5b66eb]'><img width={30} height={30} className='' src="/discord.svg" alt="" /></div>}
                                    {value.platform == "telegram" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#5386c8]'><img width={30} height={30} className='' src="/telegram.svg" alt="" /></div>}
                                    {value.platform == "farcaster" && <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#8466cb]'><img width={30} height={30} className='' src="/farcaster.svg" alt="" /></div>}

                                    <div>
                                        <div className='font-bold capitalize text-black'>{value.platform}</div>
                                        <div>{value.name}</div>
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
                                    <IDKitWidget
                                        app_id="app_staging_3a03da90c7ba5c690c94d02bb373855c" // obtained from the Developer Portal
                                        action="RealPersonVerify" // this is your action name from the Developer Portal
                                        signal="user_value" // any arbitrary value the user is committing to, e.g. a vote
                                        onSuccess={() => {
                                            setTags([...tags, {
                                                addressesRoot: "",
                                                curator: "",
                                                dataPower: 100,
                                                description: "X: FinTech FinTech FinTech",
                                                id: "132359",
                                                name: "WorldCoin: Real Human",
                                                rules: "X: FinTech",
                                                /**
                                                 * "Active" | "Hidden"
                                                 */
                                                state: "Active",
                                                zkEnable: true,
                                            } as any])
                                            // console.log("please do something here")
                                        }}
                                        credential_types={['orb', 'phone'] as any} // the credentials you want to accept
                                        enableTelemetry
                                    >
                                        {({ open }) => <div onClick={open} className='border cursor-pointer text-center mt-4 px-2 py-1 text-white bg-black rounded-lg'>Verify</div>}
                                    </IDKitWidget>
                                </div>
                            </div>
                            <div className='flex flex-col w-[180px] justify-between items-start p-6 gap-2 border rounded-md overflow-hidden'>
                                <div className='flex rounded-xl w-[45px] h-[45px] justify-center items-center bg-[#00a2e1]' style={{
                                    boxShadow: '-10px -10px 80px  #00a2e1',

                                }}><img width={30} height={30} className='' src="/twitter.svg" alt="" /></div>
                                <div>
                                    <div className='font-bold capitalize text-black'>Twitter</div>
                                    {/* <div className='border text-center mt-4 px-2 py-1 text-white bg-[#00a2e1] rounded-lg'> */}
                                    <FileUploader text={fileName ? fileName : 'upload'} className='border text-center mt-4 px-2 py-1 text-white bg-[#00a2e1] rounded-lg' handleFile={handleFile} />

                                    {/* </div> */}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div className='border mx-4'></div>
                <div className='flex flex-col justify-between w-[40%]'>
                    <div className='flex flex-wrap justify-start gap-x-3 gap-y-2'>
                        {
                            tags.length > 0 ?
                                tags.map((value, index) => {
                                    return <div key={index} className='relative border flex justify-between items-center py-2 px-4 text-[30px] text-black rounded-lg'>
                                        {value.name}
                                        <div className='absolute flex justify-center text-white  rounded-full items-center  -top-[6px] -right-[6px] w-[20px] h-[20px] bg-[#008093]'>
                                            <img width={10} height={10} src="/cross.svg" alt="" />
                                        </div>

                                    </div>
                                }) : <div>
                                    loading
                                </div>
                        }
                    </div>
                    <MyButton onClick={() => { handleSign("zkproof") }}>
                        Encrypt
                    </MyButton>
                </div>
            </div>
        </main>
    </CustomerLayout >

}
