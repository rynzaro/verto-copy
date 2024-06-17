"use client";

import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState } from "react";
import TokenDropdown from "@/components/TokenDropdown";
import { availableTokens } from "@/lib/availableTokens";

const MAX_GAS = "300000000000000";

export default function CreateTradeForm() {
    const { accountId, callMethod, callMethods, viewMethod, signIn, status } =
        useNearWallet();
    const [decimalsFrom, setDecimalsFrom] = useState(0);
    const [decimalsTo, setDecimalsTo] = useState(0);
    const [paritalFill, setPartialFill] = useState(false);
    const [privateTrade, setPrivateTrade] = useState(false);

    const [selectedFromToken, setSelectedFromToken] = useState<typeof availableTokens[number]>(availableTokens[0]);
    const [selectedToToken, setSelectedToToken] = useState<typeof availableTokens[number]>(availableTokens[1]);

    const [values, setValues] = useState({
        from_amount: "",
        to_amount: "",
    });

    function handleDecimals() {
        if (values.to_amount.indexOf(".") !== -1) {
            const split_famount = values.to_amount.split(".");
            values.to_amount =
                split_famount[0] + split_famount[1].padEnd(decimalsTo, "0");
        } else {
            values.to_amount = values.to_amount + "".padEnd(decimalsTo, "0");
        }

        if (values.from_amount.indexOf(".") !== -1) {
            const split_famount = values.from_amount.split(".");
            values.from_amount =
                split_famount[0] + split_famount[1].padEnd(decimalsFrom, "0");
        } else {
            values.from_amount = values.from_amount + "".padEnd(decimalsFrom, "0");
        }
    }

    async function callTransferMethod() {
        let transactions = []
        const jsonObject = {
            type: "make",
            to_contract_id: selectedToToken.contractId,
            from_contract_id: selectedFromToken.contractId,
            to_amount: values.to_amount,
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
                    deposit: "1000000000000000000000000",
                });
            }
        }

        if (selectedFromToken.contractId === "near") {
            transactions.push({
                contractId: "verto.testnet",
                method: "make_order",
                args: { msg: jsonString },
                gas: MAX_GAS,
                deposit: values.from_amount,
            });
        } else {
            transactions.push({
                contractId: selectedFromToken.contractId,
                method: "ft_transfer_call",
                args: {
                    receiver_id: "verto.testnet",
                    amount: values.from_amount,
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

        handleDecimals()

        callTransferMethod()
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col py-4 px-4 w-full rounded-lg mb-2 justify-between ring-1 ring-gray-500">
                <div className="uppercase mb-2 font-medium">Offering</div>
                <div className="flex">
                    <input
                        type="number"
                        name="from_amount"
                        id="from_amount"
                        onChange={(e) => handleInput(e, setValues)}
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
                        onChange={(e) => handleInput(e, setValues)}
                        className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none"
                        placeholder="Enter Amount"
                    />
                    <div className="w-1/4"><TokenDropdown
                        selected={selectedToToken}
                        setSelected={setSelectedToToken}
                    /></div>

                </div>

            </div>
            <div className="my-8">
                <fieldset>
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
                </fieldset>
                {privateTrade ? (
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
                )}
            </div>
            {status === "unauthenticated" ? (

                <button
                    type="button"
                    className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                    Connect Wallet to Create Order
                </button>

            ) : (
                <button
                    type="submit"
                    className="text-bold text-xl transition-bg hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 w-full rounded-lg  bg-gradient-to-r from-vblue to-lime-400 px-3 py-3 font-semibold text-zinc-900 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    Create Order
                </button>
            )}
        </form>
    );
}