import clsx from "clsx";
import Arrow from "./Arrow";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Paper, DialogContentText, DialogActions, Button, TableContainer, Table, TableHead, TableCell, TableRow, TableBody } from "@mui/material";
import { Tag } from "@/type";


export default function Pay({ payUSD, tag, setTag }: { payUSD: number, tag: Tag, setTag: React.Dispatch<React.SetStateAction<Tag>> }) {
    const [open, setOpen] = useState(false)
    // const [tag, setTag] = useState<Tag>()
    const handleClose = () => {
        setOpen(false)
    }
    const handleOpen = () => {
        setOpen(true)
    }
    function createData(
        tag: string,
        description: string,
        count: number,
        price: number,
    ) {
        return { tag, description, count, price };
    }
    const rows = [
        createData('Tag 1', "Frozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurt", 1, 0.011),
        createData('Tag 2', "Frozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurt", 12, 0.012),
        createData('Tag 3', "Frozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurt", 13, 0.013),
        createData('Tag 4', "Frozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurtFrozen yoghurt", 14, 0.014),
    ];
    console.log(tag)
    return <>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                What Tag Do You Want To Receive?
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