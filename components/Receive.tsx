import clsx from "clsx";
import Arrow from "./Arrow";
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Paper, DialogContentText, DialogActions, Button, TableContainer, Table, TableHead, TableCell, TableRow, TableBody } from "@mui/material";
import { Tag } from "@/type";
import { useContractReads, erc20ABI } from 'wagmi'
import { dataSwapContract } from "@/contracts/dataSwapContract";
import { formatEther } from "viem";


export default function Pay({ payUSD, tag, setTag }: { payUSD: number, tag: Tag, setTag: React.Dispatch<React.SetStateAction<Tag>> }) {
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState<Tag[]>([])
    // const [tag, setTag] = useState<Tag>()
    const handleClose = () => {
        setOpen(false)
    }
    const handleOpen = () => {
        setOpen(true)
    }
    function createData(
        id: number,
        tag: string,
        description: string,
        count: number,
        price: number,
    ) {
        return { id, tag, description, count, price };
    }
    const ids = [7074046504243040256, 7086575438692093952, 7093087508845563904, 7098147946901803008]
    const { data, isError, isLoading } = useContractReads({
        contracts: [
            {
                ...dataSwapContract as any,
                functionName: 'tagPrices',
                args: [ids[0]],
            },
            {
                ...dataSwapContract as any,
                functionName: 'tagPrices',
                args: [ids[1]],
            },
            {
                ...dataSwapContract as any,
                functionName: 'tagPrices',
                args: [ids[2]],
            },
            {
                ...dataSwapContract as any,
                functionName: 'tagPrices',
                args: [ids[3]],
            }
        ],
    })
    useEffect(() => {
        const temp = data?.map((item, index) => {
            return createData(ids[index], `Tag ${index + 1}`, "Frozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurt", 12, Number(formatEther(item.result as any)))
        })
        setRows(temp as Tag[])
    }, [data])
    return <>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Hi! May I ask where we can upload the materials?
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 150 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Tag</TableCell>
                                <TableCell align="center">Description</TableCell>
                                <TableCell align="center">Count</TableCell>
                                <TableCell align="center">Price<br />(BNB/Mail)</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.tag}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}
                                >
                                    <TableCell align="center">
                                        {row.tag}
                                    </TableCell>
                                    <TableCell align="center">{row.description}</TableCell>
                                    <TableCell align="center">{row.count}</TableCell>
                                    <TableCell align="center">{row.price}</TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => {
                                            setTag(row)
                                            setOpen(false)
                                        }}>Select</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog >
        <div className={clsx('flex flex-col',
            'h-[12opx] p-[16px]',
            'bg-[#f9f9f9] rounded-[16px]',
            'text-[14px] text-[#7c7c7c]'
        )}>
            <div>You Receive</div>
            <div className='flex justify-between items-center'>
                <div className='text-[36px]'>{(payUSD / (tag?.price as number)).toFixed(0) || 0}</div>
                {<div onClick={handleOpen} className='px-[12px] cursor-pointer flex justify-start items-center shadow-md bg-[#1f7f94] text-white gap-1  h-[34px] rounded-full text-[20px]'>
                    {tag?.tag == '' ? <>
                        Select Tag
                        <Arrow color="white" />
                    </> : <>
                        {tag?.tag}
                    </>}
                </div>
                }

            </div>
            <div className='flex gap-2 justify-between'>
                <div className='flex gap-2 justify-end'>

                </div>
                <div className='flex gap-2 justify-end'>
                    <div>Total: {tag?.count}</div>
                </div>
            </div>
        </div>
    </>
}