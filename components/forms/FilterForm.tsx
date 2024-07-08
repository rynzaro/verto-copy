"use client"

import { Order, TokenMetadata } from "@/lib/types/types";
import { convertIntToFloat, handleNumericInput } from "@/lib/utils";
import { Field, Label, MenuButton, Switch } from "@headlessui/react";
import { Dispatch, useState } from "react";

export default function FilterForm({
    orderObjects,
    setFilteredOrders,
    tokenObjects,
    showCompletedToggle,
}: {
    orderObjects: Order[],
    setFilteredOrders: Dispatch<React.SetStateAction<Order[]>>,
    tokenObjects: { [key: string]: TokenMetadata },
    showCompletedToggle: boolean,
}) {
    const [values, setValues] = useState({
        minFromAmount: "",
        maxFromAmount: "",
        minToAmount: "",
        maxToAmount: "",
        minPrice: "",
        maxPrice: "",
        showCompleted: true,
    });
    const [visible, setVisible] = useState(false);
    const filterIcon =
        (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>)

    function onSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        filterOrders();

    }

    function filterOrders() {
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

            console.log(order.status, (values.showCompleted || (order.status === 'Open')))

            return (
                (fromAmount >= minFromAmount && fromAmount <= maxFromAmount)
                && (toAmount >= minToAmount && toAmount <= maxToAmount)
                && (price >= minPrice && price <= maxPrice)
                && (!values.showCompleted || (order.status === 'Open'))
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
            showCompleted: true,
        });
    }

    function toggleVisible() {
        setVisible(prev => !prev);
    }

    function toggleShowCompleted() {
        console.log('Toggled', values.showCompleted)
        setValues((prev) => ({
            ...prev,
            showCompleted: !prev.showCompleted
        }))
        filterOrders();
    }

    const filterMenu = (
        <div className="flex">
            <button
                className="relative flex rounded-md bg-verto_bg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                onClick={toggleVisible}>
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <span className="inline-flex items-center gap-x-1.5 rounded-md button-gradient px-3.5 py-2 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                    Filter
                </span>
            </button>
            {showCompletedToggle ?
                <Field className="flex items-center relative text-white mx-4">
                    <Switch
                        checked={values.showCompleted}
                        onChange={toggleShowCompleted}
                        className="group relative inline-flex items-center h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-verto_border bg-verto_bg transition-colors duration-200 ease-in-out  data-[checked]:bg-lime-300"
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-verto_bg shadow ring-0 transition duration-200  ease-in-out ${values.showCompleted ? 'translate-x-9' : 'translate-x-1'}`} // Adjusted translate values
                        />
                    </Switch>
                    <Label as="span" className="ml-3 text-sm ">
                        <span className="font-medium text-white">Show Completed Orders</span>{' '}
                    </Label>
                </Field>


                :
                <></>
            }
        </div>
    )

    if (!visible) {
        return filterMenu
    }

    return (

        <div className="relative">
            {filterMenu}
            <div className="w-[450px] bg-verto_bg mb-2 ring-2 ring-verto_border rounded-xl px-3 py-4 absolute mt-2">
                <div className="uppercase mb-1">From Amount</div>
                <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col py-2 px-2 rounded-lg mb-2 ring-1 ring-verto_border">
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
                    <div className="flex flex-col py-2 px-2 rounded-lg mb-2 ring-1 ring-verto_border">
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
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
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
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
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
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
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
                    <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
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


