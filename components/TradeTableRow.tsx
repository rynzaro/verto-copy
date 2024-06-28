"use client";

import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { useEffect, useState } from "react";
import Image from "next/image";
import { convertIntToFloat } from "@/lib/utils";

export default function TradeTableRow() {
    const tokenObjects = useFetchTokenObjects();
    const [fromObject, setFromObject] = useState<typeof tokenObjects[number]>()
    const [toObject, setToObject] = useState<typeof tokenObjects[number]>()

    const order = {
        maker: 'vertoalice.near',
        from_token: 'near',
        to_token: 'usdc.fakes.testnet',
        from_amount: '1225',
        to_amount: '1005000000000000000000000000'
    }

    const testDecimals = 6
    const testNumber = '104000'

    useEffect(() => {
        setFromObject(tokenObjects[order.from_token])
        setToObject(tokenObjects[order.to_token])
    }, [tokenObjects])

    return (
        <>
            {(fromObject && toObject) ?
                <div className='py-2 flex align-center'>
                    <span className='flex'>
                        <Image src={fromObject.icon} alt={fromObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover -mr-1 border-zinc-400 border-2" aria-hidden="true" />
                        <Image src={toObject.icon} alt={toObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover border-zinc-400 border-2" aria-hidden="true" />
                    </span>
                    <div className="flex items-center">{order.from_amount} {fromObject.symbol}</div>
                    <div className="flex items-center">{order.to_amount} {toObject.symbol}</div>

                </div>

                : <></>}
            <div>Decimals: {testDecimals}</div>
            <div>Before: {testNumber}</div>
            <div>After: {convertIntToFloat(testNumber, testDecimals)}</div>
        </>
    )
}