export default function MyButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
    return <div onClick={onClick} className='cursor-pointer self-end w-[140px] rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
        {children}
    </div>
}