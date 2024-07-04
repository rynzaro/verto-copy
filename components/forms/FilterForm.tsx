"use client"

import { Order, TokenMetadata } from "@/lib/types/types";
import { convertIntToFloat, handleNumericInput } from "@/lib/utils";
import { MenuButton } from "@headlessui/react";
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
        minPrice: "",
        maxPrice: "",
    });
    const [visible, setVisible] = useState(false);
    const filterIcon =
        (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>)

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

    function clearFilter() {
        setValues({
            minFromAmount: "",
            maxFromAmount: "",
            minToAmount: "",
            maxToAmount: "",
            minPrice: "",
            maxPrice: "",
        });
    }

    function toggleVisible() {
        setVisible(prev => !prev);
    }

    const filterButton =
        (<button
            className="relative flex rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
            onClick={toggleVisible}>
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <span className="inline-flex items-center gap-x-1.5 rounded-md bg-gradient-to-r from-green-400 to-lime-300  hover:from-green-300 px-3.5 py-2 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                Filter
            </span>
        </button>)

    if (!visible) {
        return filterButton
    }

    return (

        <div className="relative">
            {filterButton}
            <div className="w-[450px] bg-black mb-2 ring-1 ring-white rounded-xl px-3 py-4 absolute mt-2">
                <div className="uppercase mb-1">From Amount</div>
                <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col py-2 px-2 rounded-lg mb-2 ring-1 ring-gray-500">
                        <div className="flex">
                            <input
                                type="text"
                                name="minFromAmount"
                                id="minFromAmount"
                                value={values.minFromAmount}
                                onChange={(e) => handleNumericInput(e, setValues, 20)}
                                autoComplete="off"
                                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                                placeholder="MIN"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col py-2 px-2 rounded-lg mb-2 ring-1 ring-gray-500">
                        <div className="flex">
                            <input
                                type="text"
                                name="maxFromAmount"
                                id="maxFromAmount"
                                value={values.maxFromAmount}
                                onChange={(e) => handleNumericInput(e, setValues, 20)}
                                autoComplete="off"
                                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                                placeholder="MAX"
                            />
                        </div>
                    </div>
                </div>

                <div className="uppercase mb-1">To Amount</div>
                <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                        <div className="flex">
                            <input
                                type="text"
                                name="minToAmount"
                                id="minToAmount"
                                value={values.minToAmount}
                                onChange={(e) => handleNumericInput(e, setValues, 20)}
                                autoComplete="off"
                                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                                placeholder="MIN"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                        <div className="flex">
                            <input
                                type="text"
                                name="maxToAmount"
                                id="maxToAmount"
                                value={values.maxToAmount}
                                onChange={(e) => handleNumericInput(e, setValues, 20)}
                                autoComplete="off"
                                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                                placeholder="MAX"
                            />
                        </div>
                    </div>
                </div>

                <div className="uppercase mb-1">Price</div>
                <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                        <div className="flex">
                            <input
                                type="text"
                                name="minPrice"
                                id="minPrice"
                                value={values.minPrice}
                                onChange={(e) => handleNumericInput(e, setValues, 20)}
                                autoComplete="off"
                                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                                placeholder="MIN"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                        <div className="flex">
                            <input
                                type="text"
                                name="maxPrice"
                                id="maxPrice"
                                value={values.maxPrice}
                                onChange={(e) => handleNumericInput(e, setValues, 20)}
                                autoComplete="off"
                                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                                placeholder="MAX"
                            />
                        </div>
                    </div>
                </div>


                <div className="flex justify-center items-center gap-2 mt-2">

                        <button
                            className="rounded-md w-full py-2 px-2 bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300  text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            onClick={onSubmit}
                        >Filter</button>
                        <button
                            className="rounded-md w-full py-2 px-2 bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            onClick={clearFilter}
                        >Clear</button>
                </div>
            </div>

        </div>
    )

}


