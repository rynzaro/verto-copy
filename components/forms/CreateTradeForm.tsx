"use client";

import { convertFloatToInt, handleInput, handleNumericInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState } from "react";
import TokenDropdown from "@/components/TokenDropdown";
import { availableTokens } from "@/lib/availableTokens";
import { TokenMetadata, defaultTokenMetadata } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import numberSlice from "../numberSlice";
import { stringify } from "querystring";

const MAX_GAS = "300000000000000";

export default function CreateTradeForm() {
    const { accountId, callMethods, viewMethod, status } =
        useNearWallet();
    const tokenObjects = useFetchTokenObjects();
    const [partialFill, setPartialFill] = useState(false);
    const [privateTrade, setPrivateTrade] = useState(false);
    const [selectedFromToken, setSelectedFromToken] = useState<TokenMetadata>(defaultTokenMetadata);
    const [selectedToToken, setSelectedToToken] = useState<TokenMetadata>(defaultTokenMetadata);
    const [isHovered, setHovered] = useState(false);

    const [values, setValues] = useState({
        from_amount: "",
        to_amount: "",
    });

    useEffect(() => {
        if (Object.values(tokenObjects)[0] && (selectedFromToken === defaultTokenMetadata || selectedToToken === defaultTokenMetadata)) {
            setSelectedFromToken(Object.values(tokenObjects)[0]);
            setSelectedToToken(Object.values(tokenObjects)[1]);
        }
        console.log(Object.values(tokenObjects)[0])
    }, [tokenObjects]);

    function numSlice(num: number) {
        if (isHovered) {
            return num.toString() 
        } else {
            return num.toFixed(4) + "..."
        }

    }
    
    async function callTransferMethod(fromAmount: string, toAmount: string) {
        let transactions = []
        const jsonObject = {
            type: "make",
            to_contract_id: selectedToToken.contractId,
            from_contract_id: selectedFromToken.contractId,
            to_amount: toAmount,
            to_account: null,
        };
        const jsonString = JSON.stringify(jsonObject);

        if (selectedToToken.contractId !== "near") {
            const storageBalanceTo = await viewMethod({
                contractId: selectedToToken.contractId,
                method: "storage_balance_of",
                args: {
                    account_id: accountId,
                },
            })

            if (storageBalanceTo === null) {
                transactions.push({
                    contractId: selectedToToken.contractId,
                    method: "storage_deposit",
                    args: {
                        account_id: accountId,
                        registration_only: true,
                    },
                    gas: MAX_GAS,
                    deposit: "100000000000000000000000",
                });
            }
        }

        if (selectedFromToken.contractId === "near") {
            transactions.push({
                contractId: "verto.testnet",
                method: "make_order",
                args: { msg: jsonString },
                gas: MAX_GAS,
                deposit: fromAmount,
            });
        } else {
            transactions.push({
                contractId: selectedFromToken.contractId,
                method: "ft_transfer_call",
                args: {
                    receiver_id: "verto.testnet",
                    amount: fromAmount,
                    msg: jsonString,
                },
                gas: MAX_GAS,
                deposit: "1",
            });
        }

        callMethods(transactions).catch((error) => console.log(error));


    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (values.from_amount === '' || values.to_amount === '') {
            return
        }
        let fromAmount = convertFloatToInt(values.from_amount, selectedFromToken.decimals)
        let toAmount = convertFloatToInt(values.to_amount, selectedToToken.decimals)
        callTransferMethod(fromAmount, toAmount)
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col py-4 px-4 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                <div className="uppercase mb-2 font-medium">Offering</div>
                <div className="flex">
                    <input
                        type="text"
                        name="from_amount"
                        id="from_amount"
                        value={values.from_amount}
                        onChange={(e) => handleNumericInput(e, setValues, selectedFromToken.decimals)}
                        autoComplete="off"
                        className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none"
                        placeholder="Enter Amount"
                    />
                    <div className="w-1/4"><TokenDropdown
                        selected={selectedFromToken}
                        setSelected={setSelectedFromToken}
                    /></div>
                </div>
            </div>
            <div className="flex flex-col mt-4 py-4 px-4 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                <div className="uppercase mb-2 font-medium">For</div>
                <div className="flex ">
                    <input
                        type="text"
                        name="to_amount"
                        id="to_amount"
                        value={values.to_amount}
                        onChange={(e) => handleNumericInput(e, setValues, selectedToToken.decimals)}
                        autoComplete="off"
                        className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none"
                        placeholder="Enter Amount"
                    />
                    <div className="w-1/4"><TokenDropdown
                        selected={selectedToToken}
                        setSelected={setSelectedToToken}
                    /></div>
                </div>
            </div>
            {values.from_amount && values.to_amount ? 
            <div className="flex flex-col py-4 px-4 w-full rounded-lg mb-2 mt-4 justify-between ring-1 ring-gray-500"> 
                <div>EXCHANGE RATE:</div>
                <div className="flex">
                        1 {selectedFromToken.symbol} ⇌ 
                        <div  
                            onMouseEnter={() => setHovered(true)} 
                            onMouseLeave={()=> setHovered(false)} 
                            className="px-1"
                        >
                            {numSlice(values.to_amount / values.from_amount)}
                        </div> 
                        {selectedToToken.symbol}
                </div>
            </div> : <></>}
            <div className="my-8">

                {/* SPECIAL TRADE OPTIONS */}

                {/* <fieldset>
                    <div className="space-y-5">
                        <div className="relative flex items-start">
                            <div className="flex h-6 items-center">
                                <input
                                    id="candidates"
                                    aria-describedby="candidates-description"
                                    name="candidates"
                                    type="checkbox"
                                    className="h-4 w-4 rounded bg-transparent border-gray-300 text-green-400 focus:ring-green-400"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label htmlFor="candidates" className="font-medium text-zinc-400">
                                    Partial Fill
                                </label>
                                <p id="candidates-description" className="text-zinc-500">
                                    Allow partial fill of the order.
                                </p>
                            </div>
                        </div>
                        <div className="relative flex items-start">
                            <div className="flex h-6 items-center">
                                <input
                                    id="candidates"
                                    aria-describedby="candidates-description"
                                    name="candidates"
                                    type="checkbox"
                                    className="h-4 w-4 rounded bg-transparent border-gray-300 text-green-400 focus:ring-green-400"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label htmlFor="candidates" className="font-medium text-zinc-400">
                                    Private Trade
                                </label>
                                <p id="candidates-description" className="text-zinc-500">
                                    Trade privately with a specific user.
                                </p>
                            </div>
                        </div>

                    </div>
                </fieldset> */}

                {/* PRIVATE TRADE LOGIC */}

                {/* {privateTrade ? (
                    <>
                        <input
                            type="text"
                            name="to_account"
                            id="to_account"
                            onChange={(e) => handleInput(e, setValues)}
                            className="placeholder:text-zinc-700 placeholder:font-bold hover-inset-border2 mt-1 w-full text-center text-bold rounded-lg bg-verto_bg border-2 border-verto_borders mb-1 p-3 text-verto_wt focus:outline-none"
                            placeholder="ENTER TARGET WALLET ADDRESS"
                        />
                    </>
                ) : (
                    <></>
                )} */}
            </div>
            {status === "unauthenticated" ? (

                <button
                    type="button"
                    className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                    Connect Wallet to Create Order
                </button>

            ) : (
                <button
                    type="submit"
                    className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                    Create Order
                </button>
            )}
        </form>
    );
}