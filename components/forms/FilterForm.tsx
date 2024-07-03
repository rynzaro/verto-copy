"use client"

import { Order, TokenMetadata } from "@/lib/types/types";
import { convertIntToFloat, handleNumericInput } from "@/lib/utils";
import { Dispatch, useState } from "react";

export default function FilterForm({
    orderObjects,
    setFilteredOrders,
    tokenObjects
}: {
    orderObjects: Order[],
    setFilteredOrders: Dispatch<React.SetStateAction<Order[]>>,
    tokenObjects: { [key: string]: TokenMetadata }
}) {
    const [values, setValues] = useState({
        minFromAmount: "",
        maxFromAmount: "",
        minToAmount: "",
        maxToAmount: "",
        minPrice:"",
        maxPrice:"",
    });
    console.log(orderObjects)
    function onSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();

        const minFromAmount = values.minFromAmount ? parseFloat(values.minFromAmount) : -Infinity;
        const maxFromAmount = values.maxFromAmount ? parseFloat(values.maxFromAmount) : Infinity;
        const minToAmount = values.minToAmount ? parseFloat(values.minToAmount) : -Infinity;
        const maxToAmount = values.maxToAmount ? parseFloat(values.maxToAmount) : Infinity;
        const minPrice = values.minPrice ? parseFloat(values.minPrice) : -Infinity;
        const maxPrice = values.maxPrice ? parseFloat(values.maxPrice) : Infinity;

        const newOrderObjects = orderObjects.filter((order: Order) => {
            if (!(tokenObjects[order.from_contract_id] && tokenObjects[order.to_contract_id])) {
                return false;
            }
            const fromAmount = parseFloat(convertIntToFloat(order.from_amount, tokenObjects[order.from_contract_id].decimals));
            const toAmount = parseFloat(convertIntToFloat(order.to_amount, tokenObjects[order.to_contract_id].decimals));
            const price = toAmount / fromAmount;
            
            console.log(tokenObjects[order.to_contract_id])
            return (
                (fromAmount >= minFromAmount && fromAmount <= maxFromAmount)
                && (toAmount >= minToAmount && toAmount <= maxToAmount)
                && (price >= minPrice && price <= maxPrice)
            );
        });
        setFilteredOrders(newOrderObjects)
    }

    return (
        <div>
            Filter From Order Size
            <div>
                <input
                    className="text-black"
                    type="text"
                    name="minFromAmount"
                    id="minFromAmount"
                    placeholder="min"
                    onChange={(e) => handleNumericInput(e, setValues, 10)}
                    value={values.minFromAmount}
                />
                <input
                    className="text-black"
                    type="text"
                    name="maxFromAmount"
                    id="maxFromAmount"
                    placeholder="max"
                    onChange={(e) => handleNumericInput(e, setValues, 10)}
                    value={values.maxFromAmount}
                />
            </div>
            Filter To Oder Size
            <div>
                <input
                    className="text-black"
                    type="text"
                    name="minToAmount"
                    id="minToAmount"
                    placeholder="min"
                    onChange={(e) => handleNumericInput(e, setValues, 10)}
                    value={values.minToAmount}
                />
                <input
                    className="text-black"
                    type="text"
                    name="maxToAmount"
                    id="maxToAmount"
                    placeholder="max"
                    onChange={(e) => handleNumericInput(e, setValues, 10)}
                    value={values.maxToAmount}
                />
            </div>
            Filter Price
            <div>
                <input
                    className="text-black"
                    type="text"
                    name="minPrice"
                    id="minPrice"
                    placeholder="min"
                    onChange={(e) => handleNumericInput(e, setValues, 10)}
                    value={values.minPrice}
                />
                <input
                    className="text-black"
                    type="text"
                    name="maxPrice"
                    id="maxPrice"
                    placeholder="max"
                    onChange={(e) => handleNumericInput(e, setValues, 10)}
                    value={values.maxPrice}
                />
            </div>
            <div>
                <button
                    className="rounded-md bg-gradient-to-r from-green-400 to-lime-300 w-[60px] hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    onClick={onSubmit}
                >Filter</button>
            </div>

        </div>
    )

}


