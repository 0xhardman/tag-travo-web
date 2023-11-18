import { Backdrop, CircularProgress } from "@mui/material"
import { useState } from "react"

export default function useLoading() {
    const [open, setOpen] = useState(false)
    const Loading = (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
            <CircularProgress color="inherit" />
        </Backdrop>
    )
    return { setLoading: setOpen, Loading }
}