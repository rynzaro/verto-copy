"use client";

import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TradeTableRow() {
    const tokenObjects = useFetchTokenObjects();
    const [fromObject, setFromObject] = useState<typeof tokenObjects[number]>()
    const [toObject, setToObject] = useState<typeof tokenObjects[number]>()
    
    const order = {
        maker: 'vertoalice.near',
        from_token: 'near',
        to_token: 'usdc.fakes.testnet',
        from_amount: '1.225',
        to_amount: '100500000'
    }


    useEffect(() => {
        setFromObject(tokenObjects[order.from_token])
        setToObject(tokenObjects[order.to_token])
    }, [tokenObjects])

    return (
        <div className='py-2'>
            {(fromObject && toObject)?
                <span className='flex'>

                    <Image src={fromObject.icon} alt={fromObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover -mr-1 border-zinc-400 border-2" aria-hidden="true" />
                    <Image src={toObject.icon} alt={toObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover border-zinc-400 border-2" aria-hidden="true" />
                </span>
                : <></>}
        </div>
    )
}