import clsx from "clsx";
import Arrow from "./Arrow";
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Paper, DialogContentText, DialogActions, Button, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Checkbox } from "@mui/material";
// import { Tag } from "@/type";
import { dataSwapContract } from "@/contracts/dataSwapContract";
import { formatEther, parseEther } from "viem";
import {GetTagCounts, GetTags, Tag} from "@/utils/APIs";
import { readContract } from '@wagmi/core'


export default function Pay({ payUSD, selectTags, setSelectTags }: { payUSD: number, selectTags: Tag[], setSelectTags: (tags: Tag[]) => void }) {
    const [open, setOpen] = useState(false)
    const [price, setPrice] = useState(0)
    // const [rows, setRows] = useState<Tag[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [tagCounts, setTagCounts] = useState({})
    // const [selectTags, setSelectTags] = useState<Tag[]>([])
    const handleClose = () => {
        setOpen(false)
    }
    const handleOpen = () => {
        setOpen(true)
    }
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        (async () => {
            const allTags = await GetTags()
            const tagCounts = await GetTagCounts()
            console.log(allTags)
            setTags(allTags)
            setTagCounts(tagCounts)
        })()
    }, [])
    useEffect(() => {
        (async () => {
            const sortedIds = tags.map((tag) => parseInt(tag.id)).sort()
            const key = await readContract({
                ...dataSwapContract as any,
                functionName: 'getKey',
                args: [sortedIds],
            })
            let max = BigInt(0)
            await Promise.all(selectTags.map(async (tag) => {
                const price = await readContract({
                    ...dataSwapContract as any,
                    functionName: 'tagPrices',
                    args: [tag.id],
                }) as bigint
                if (price > max) max = price
            }))

            setPrice(Number(formatEther(max)))
        })()
    }, [selectTags])
    // useEffect(() => {
    //     if (isError) {
    //         console.log(error)
    //         return
    //     }
    //     if (data?.length || 0 > 0) {
    //         console.log(data)
    //     } else {
    //         return
    //     }
    //     const temp = data?.map((item, index) => {
    //         return createData(tags[index].id, tags[index].tag, tags[index].description, tags[index].count, Number(formatEther(item?.result as any || 0)))
    //     })
    //     setRows(temp as Tag[])
    // }, [data, isError])
    return <>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
            Which tags would you like to send messages to?
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 150 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Tag</TableCell>
                                <TableCell align="center">Description</TableCell>
                                <TableCell align="center">Count</TableCell>
                                <TableCell align="center">Select</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tags.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}
                                >
                                    <TableCell align="center">
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="center">{row.description}</TableCell>
                                    <TableCell align="center">{tagCounts[row.id] || 0}</TableCell>
                                    <TableCell align="center">
                                        <Checkbox checked={!!selectTags.find((tag) => tag.id == row.id)} onClick={() => {
                                            if (selectTags.find((tag) => tag.id == row.id)) {
                                                setSelectTags(selectTags.filter((tag) => tag.id != row.id))
                                            } else {
                                                setSelectTags([...selectTags, row])
                                            }
                                        }} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog >
        <div className={clsx('flex flex-col',
            'h-[12opx] p-[16px]',
            'bg-[#f9f9f9] rounded-[16px]',
            'text-[14px] text-[#7c7c7c]'
        )}>
            <div>You Receive</div>
            <div className='flex justify-between items-center'>
                <div className='text-[36px]'>{(payUSD / (price)).toFixed(0) || 0}</div>
                {<div onClick={handleOpen} className=' px-[12px] cursor-pointer flex justify-start items-center shadow-md bg-[#1f7f94] text-white gap-1  h-[34px] rounded-full text-[20px]'>
                    {selectTags.length == 0 ? <>
                        Select Tag
                        <Arrow color="white" />
                    </> : <>
                        {selectTags.map((tag) => {
                            return tag.name
                        }).join(',').slice(0, 10) + '...' + selectTags.length + ' tags'}
                    </>}
                </div>
                }

            </div>
            <div className='flex gap-2 justify-between'>
                <div className='flex gap-2 justify-end'>

                </div>
                <div className='flex gap-2 justify-end'>
                    <div>Total: {Math.min(...selectTags.map(t => tagCounts[t.id] || 0))} User Data</div>
                </div>
            </div>
        </div>
    </>
}
