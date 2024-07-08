"use client";

import { convertIntToFloat, convertFloatToInt, handleInput, handleNumericInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState } from "react";
import TokenDropdown from "@/components/TokenDropdown";
import { availableTokens } from "@/lib/availableTokens";
import { TokenMetadata, defaultTokenMetadata } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { stringify } from "querystring";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { VertoContract } from "@/lib/config/near";

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



    const [activeInput, setActiveInput] = useState({
        fromInput: false,
        toInput: false
    })
    
    const [balances, setBalances] = useState({
        from_balance: 0,
        to_balance: 0
    })

    const [values, setValues] = useState({
        from_amount: "",
        to_amount: "",
    });

        useEffect(() => {
            const fetchBalances = async () => {
                try {
                    const fromBalance = await viewMethod({
                        contractId: selectedFromToken.contractId,
                        method: "ft_balance_of",
                        args: {
                            account_id: accountId,
                        },
                    });
                    const toBalance = await viewMethod({
                        contractId: selectedToToken.contractId,
                        method: "ft_balance_of",
                        args: {
                            account_id: accountId,
                        },
                    });
                    setBalances({
                        from_balance: fromBalance,
                        to_balance: toBalance
                    });
                } catch (error) {
                    console.error("Failed to fetch balances!", error);
                }
            };
    
            fetchBalances();
        }, [selectedFromToken.contractId, selectedToToken.contractId]);

    const validFrom =  (0 < parseFloat(values.from_amount)) && (parseFloat(values.from_amount) <= balances.from_balance)
    const validFor = 0 < parseFloat(values.to_amount)

    const noFrom = isNaN(parseFloat(values.from_amount))
    const noFor = isNaN(parseFloat(values.to_amount))

    const auth = status === "authenticated"
    const validTokens = selectedFromToken.contractId !== selectedToToken.contractId

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

    function removeTrailingZerosAndComma(input: string): string {
        return input.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    }

    function numSlice(num: number) {
        return removeTrailingZerosAndComma(num.toFixed(12))

    }

    function swapTradingPair() {
        let tempFrom = selectedFromToken
        setSelectedFromToken(selectedToToken)
        setSelectedToToken(tempFrom)
        setValues((prev) => ({
            from_amount: prev.to_amount,
            to_amount: prev.from_amount
        }))
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
                contractId: VertoContract,
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
                    receiver_id: VertoContract,
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
                setFailedCreation(false)
                setSuccesfulCreation(true)
                setValues({
                    from_amount: "",
                    to_amount: "",
                })
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
                    <button onClick={() => setSuccesfulCreation(false)} className="ml-auto bg-green-50 text-green-800 rounded-lg focus:ring-2 focus:ring-green-400 p-1 hover:bg-red-200 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 14">
                            <path d="M10.833 3.833L7 7.667m0 0L3.167 3.833m3.833 3.834L3.167 10.5m3.833-3.833L10.833 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
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
                    <button onClick={() => setFailedCreation(false)} className="ml-auto bg-red-50 text-red-800 rounded-lg focus:ring-2 focus:ring-red-400 p-1 hover:bg-red-200 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 14">
                            <path d="M10.833 3.833L7 7.667m0 0L3.167 3.833m3.833 3.834L3.167 10.5m3.833-3.833L10.833 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                : <></>
            }

            <form onSubmit={handleSubmit}>
                <div className={`flex flex-col py-4 px-4 w-full rounded-lg mb-2 justify-between ${ !auth || noFrom ? "ring-verto_border ring-1 hover:ring-2" : (validFrom ? 'ring-lime-400 ring-2' : 'ring-red-600 ring-2 focus-within:ring-red-600')} ring-gray-500 hover:ring-2 focus-within:ring-gray-300 focus-within:ring-2`}>
                    <div className="uppercase mb-2 font-medium">Offering</div>
                    <div className="flex">
                        <input
                            type="text"
                            name="from_amount"
                            id="from_amount"
                            value={values.from_amount}
                            onChange={(e) => handleNumericInput(e, setValues, selectedFromToken.decimals)}
                            // use toLocaleString() for comma formatting
                            autoComplete="off"
                            className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus:border-none"
                            placeholder="Enter Amount"
                            onFocus={() => setActiveInput({fromInput: true, toInput: false})}
                            onBlur={() => setActiveInput({fromInput: false, toInput: false})}
                        />
                        <div className="w-1/4"><TokenDropdown
                            selected={selectedFromToken}
                            setSelected={setSelectedFromToken}
                        /></div>
                    </div>
                    <div className={` ${ !auth ? "text-transparent hover:cursor-default" : "text-white" } text-sm pt-2`}>
                        Balance: { status === "unauthenticated" ? "N/A" : balances.from_balance}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type='button'
                        className="absolute -mt-5 text-white bg-verto_bg ring-1 rounded-md ring-verto_border p-2 hover:ring-2"
                        onClick={swapTradingPair}
                    >
                        <ArrowsUpDownIcon
                            className="h-6 w-6"
                        />
                    </button>
                </div>
                <div className={`flex flex-col my-2 py-4 px-4 w-full rounded-lg  justify-between ring-1 focus-within:ring-gray-300 focus-within:ring-2 ${ !auth || noFor ? "ring-verto_border ring-1 hover:ring-2" : ( validFor ? 'ring-lime-400 ring-2' : 'ring-red-600 ring-2 focus-within:ring-red-600') }`}>
                    <div className="uppercase mb-2 font-medium">For</div>
                    <div className="flex ">
                        <input
                            type="text"
                            name="to_amount"
                            id="to_amount"
                            value={values.to_amount}
                            onChange={(e) => handleNumericInput(e, setValues, selectedToToken.decimals)}
                            // onChange={(e) => handleInput(e, 'to')}
                            autoComplete="off"
                            className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus:border-none"
                            placeholder="Enter Amount"
                            onFocus={() => setActiveInput({fromInput: false, toInput: true})}
                            onBlur={() => setActiveInput({fromInput: false, toInput: false})}
                        />
                        <div className="w-1/4"><TokenDropdown
                            selected={selectedToToken}
                            setSelected={setSelectedToToken}
                        /></div>
                    </div>
                    <div className={` ${ !auth ? "text-transparent hover:cursor-default" : "text-white" } text-sm pt-2`}>
                        Balance: { status === "unauthenticated" ? "N/A" : balances.to_balance}
                    </div>
                </div>

                <div className="flex flex-col py-4 px-4 w-full rounded-lg mb-2 mt-4 justify-between ring-1 ring-verto_border">
                    <div className="font-semibold">EXCHANGE RATE</div>
                    {values.from_amount && values.to_amount ?
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
                        :
                        <div className="text-transparent hover:cursor-default">N/A</div>}

                </div>
                {/* <div className="my-8"> */}

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
                {/* </div> */}
                { !auth ? (

                    <button
                        type="button"
                        onClick={signIn}
                        className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 hover:to-lime-200 mt-2 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                        Connect Wallet to Create Order
                    </button>

                ) : (
                    <button
                        type="submit"
                        className=
                        {
                            ( validFrom && validFor && validTokens ) ?
                                "w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 hover:to-lime-200 mt-2 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                :
                                "w-full rounded-md bg-gradient-to-r from-blue-400 hover:cursor-default to-blue-300 mt-2 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        }
                        disabled={ !(validFor && validFrom && validTokens)}
                    >
                        Create Order
                    </button>
                )}
            </form>
        </div>

    );
}