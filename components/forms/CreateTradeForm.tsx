"use client";

import { convertFloatToInt, handleInput, handleNumericInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState } from "react";
import TokenDropdown from "@/components/TokenDropdown";
import { availableTokens } from "@/lib/availableTokens";
import { TokenMetadata, defaultTokenMetadata } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { stringify } from "querystring";

const MAX_GAS = "300000000000000";

export default function CreateTradeForm() {
    const { accountId, signIn, callMethods, viewMethod, status } =
        useNearWallet();
    const tokenObjects = useFetchTokenObjects();
    const [partialFill, setPartialFill] = useState(false);
    const [privateTrade, setPrivateTrade] = useState(false);
    const [selectedFromToken, setSelectedFromToken] = useState<TokenMetadata>(defaultTokenMetadata);
    const [selectedToToken, setSelectedToToken] = useState<TokenMetadata>(defaultTokenMetadata);
    const [isHovered, setHovered] = useState(false);
    const [succesfulCreation, setSuccesfulCreation] = useState(false)
    const [failedCreation, setFailedCreation] = useState(false)

    const [values, setValues] = useState({
        from_amount: "",
        to_amount: "",
    });

    useEffect(() => {
        if (!tokenObjects) {
            return;
        }
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
        callMethods(transactions).catch((error) => console.log(error))
            .then((message) => {
                if (message === undefined) {
                    setSuccesfulCreation(false)
                    setFailedCreation(true);
                    return;
                }
                message.forEach((part: { [key: string]: string }) => {
                    if (!(part.final_execution_status === "EXECUTED_OPTIMISTIC")) {
                        setSuccesfulCreation(false)
                        setFailedCreation(true);
                        return;
                    }
                })
                setFailedCreation(false)
                setSuccesfulCreation(true)
            });
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
        <div>
            {succesfulCreation ?
                <div className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800" role="alert">
                    <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                        <span className="font-medium">Order Creation Succesful!</span> Your Order was succesfully created.
                    </div>
                </div>
                : <></>
            }

            {failedCreation ?
                <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
                    <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                        <span className="font-medium">Order Creation Failed!</span> The process was interrupted or the transaction was not submitted.
                    </div>
                </div>
                : <></>
            }

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
                                onMouseLeave={() => setHovered(false)}
                                className="px-1"
                            >
                                {numSlice(parseFloat(values.to_amount) / parseFloat(values.from_amount))}
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
                        onClick={signIn}
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
        </div>

    );
}