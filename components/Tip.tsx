import { Tag } from "@/type";
import clsx from "clsx";

export default function Tip({ tag }: { tag: Tag }) {
    return <div className={clsx('flex justify-center',
        ' p-[16px]',
        'bg-white rounded-[16px] border border-[#22222213]',
        'text-[14px] text-[#7c7c7c]'
    )}>
        <div className='text-black'>
            {
                tag.tag == '' ? 'Please Select Tag' : <>
                    1  <span className="text-[#4b85e5]">ETH</span> can send {tag.count} users with <span className='border bg-[#008093] p-[4px] rounded-lg text-white'>{tag?.tag}</span> {(1 / tag.price).toFixed(0)} times mails.</>
            }
        </div>
    </div>
}