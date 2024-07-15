"use client";

import {
  convertFloatToInt,
  convertIntToFloat,
  formatNumber,
  handleInput,
  handleNumericInput,
} from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState, useRef } from "react";
import TokenDropdown from "@/components/TokenDropdown";
import { availableTokens } from "@/lib/availableTokens";
import { TokenMetadata, defaultTokenMetadata } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { stringify } from "querystring";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { VertoContract } from "@/lib/config/near";
import { Preahvihear } from "next/font/google";

const MAX_GAS = "300000000000000";

export default function CreateTradeForm() {
  const { accountId, signIn, callMethods, viewMethod, status } =
    useNearWallet();
  const tokenObjects = useFetchTokenObjects();
  const [partialFill, setPartialFill] = useState(false);
  const [privateTrade, setPrivateTrade] = useState(false);
  const [selectedFromToken, setSelectedFromToken] =
    useState<TokenMetadata>(defaultTokenMetadata);
  const [selectedToToken, setSelectedToToken] =
    useState<TokenMetadata>(defaultTokenMetadata);
  const [succesfulCreation, setSuccesfulCreation] = useState(false);
  const [failedCreation, setFailedCreation] = useState(false);
  const [exchangeRate, setExchangeRate] = useState("");

  const [activeInput, setActiveInput] = useState({
    fromInput: false,
    toInput: false,
  });

  const [balances, setBalances] = useState({
    from_balance: 0,
    to_balance: 0,
  });

  const [values, setValues] = useState({
    fromAmount: "",
    toAmount: "",
    inputExchangeRate: "",
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
          to_balance: toBalance,
        });
      } catch (error) {
        console.error("Failed to fetch balances!", error);
      }
    };

    fetchBalances();
  }, [selectedFromToken.contractId, selectedToToken.contractId]);

  const validFrom =
    0 < parseFloat(values.fromAmount) &&
    parseFloat(
      convertFloatToInt(values.fromAmount, selectedFromToken.decimals),
    ) <= balances.from_balance;
  const validFor = 0 < parseFloat(values.toAmount);

  const noFrom = isNaN(parseFloat(values.fromAmount));
  const noFor = isNaN(parseFloat(values.toAmount));

  const auth = status === "authenticated";
  const validTokens =
    selectedFromToken.contractId !== selectedToToken.contractId;

  const [Multiple, setMultiple] = useState(1);
  const validMultiple =
    validFrom &&
    parseFloat(
      convertFloatToInt(values.fromAmount, selectedFromToken.decimals),
    ) *
      Multiple <=
      balances.from_balance;

  const maxMultiple = !validFrom
    ? 1
    : Math.min(
        10,
        Math.floor(
          balances.from_balance /
            parseFloat(
              convertFloatToInt(values.fromAmount, selectedFromToken.decimals),
            ),
        ),
      );
  const [maxClicked, setMaxClicked] = useState(false);

  const handleMultiple = () => {
    if (maxClicked) {
      setMultiple(1);
      setMaxClicked(false);
    } else if (Multiple === maxMultiple) {
      setMaxClicked(true);
    } else {
      validFrom ? setMultiple((Multiple + 1) % 11) : setMultiple(1);
    }
  };

  const validOrder = validFrom && validFor && validTokens && validMultiple;

  // const maxMultiple =
  //   parseFloat(
  //     convertFloatToInt(values.fromAmount, selectedFromToken.decimals),
  //   ) %
  //     balances.from_balance >=
  //   0;

  useEffect(() => {
    if (!tokenObjects) {
      return;
    }
    if (
      Object.values(tokenObjects)[0] &&
      (selectedFromToken === defaultTokenMetadata ||
        selectedToToken === defaultTokenMetadata)
    ) {
      setSelectedFromToken(Object.values(tokenObjects)[0]);
      setSelectedToToken(Object.values(tokenObjects)[1]);
    }
    console.log(Object.values(tokenObjects)[0]);
  }, [tokenObjects]);

  function removeTrailingZerosAndComma(input: string): string {
    return input.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }

  function numSlice(num: number) {
    return removeTrailingZerosAndComma(num.toFixed(12));
  }

  function swapTradingPair() {
    let tempFrom = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(tempFrom);
    setValues((prev) => ({
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      inputExchangeRate: prev.inputExchangeRate,
    }));
  }

  async function callTransferMethod(fromAmount: string, toAmount: string) {
    let transactions = [];
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
      });

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
      for (let i = 0; i < Multiple; i++) {
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
    }
    callMethods(transactions)
      .catch((error) => console.log(error))
      .then((message) => {
        if (message === undefined) {
          return;
        }
        setFailedCreation(false);
        setSuccesfulCreation(true);
        setValues({
          fromAmount: "",
          toAmount: "",
          inputExchangeRate: "",
        });
      });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (values.fromAmount === "" || values.toAmount === "") {
      return;
    }
    let fromAmount = convertFloatToInt(
      values.fromAmount,
      selectedFromToken.decimals,
    );
    let toAmount = convertFloatToInt(values.toAmount, selectedToToken.decimals);
    callTransferMethod(fromAmount, toAmount);
  };

  useEffect(() => {
    if (exchangeRate === "") {
      return;
    } else {
      setValues((prev) => ({
        fromAmount: (
          parseFloat(values.toAmount) * parseFloat(values.inputExchangeRate)
        ).toString(),
        toAmount: prev.toAmount,
        inputExchangeRate: prev.inputExchangeRate,
      }));
    }
  }, [values.inputExchangeRate]);

  useEffect(() => {
    if (values.fromAmount !== "" && values.toAmount !== "")
      setExchangeRate(
        (
          parseFloat(values.fromAmount) / parseFloat(values.toAmount)
        ).toString(),
      );
  }, [values.fromAmount, values.toAmount]);

  const [placeHolder, setPlaceHolder] = useState("");

  useEffect(() => {
    setPlaceHolder(
      numSlice(parseFloat(values.toAmount) / parseFloat(values.fromAmount)),
    );
  }, [values.fromAmount, values.toAmount]);

  return (
    <div className="text-white">
      {succesfulCreation ? (
        <div
          className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">Order Creation Succesful!</span> Your
            Order was succesfully created.
          </div>
          <button
            onClick={() => setSuccesfulCreation(false)}
            className="ml-auto bg-green-50 text-green-800 rounded-lg focus:ring-2 focus:ring-green-400 p-1 hover:bg-red-200 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 14 14"
            >
              <path
                d="M10.833 3.833L7 7.667m0 0L3.167 3.833m3.833 3.834L3.167 10.5m3.833-3.833L10.833 10.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <></>
      )}

      {failedCreation ? (
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">Order Creation Failed!</span> The
            process was interrupted or the transaction was not submitted.
          </div>
          <button
            onClick={() => setFailedCreation(false)}
            className="ml-auto bg-red-50 text-red-800 rounded-lg focus:ring-2 focus:ring-red-400 p-1 hover:bg-red-200 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 14 14"
            >
              <path
                d="M10.833 3.833L7 7.667m0 0L3.167 3.833m3.833 3.834L3.167 10.5m3.833-3.833L10.833 10.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <></>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className={`flex flex-col py-4 px-4 w-full rounded-lg mb-2 justify-between ${!auth || noFrom ? "ring-verto_border ring-1 hover:ring-2" : validFrom ? "ring-lime-400 ring-2" : "ring-red-600 ring-2 focus-within:ring-red-600"} ring-gray-500 hover:ring-2 focus-within:ring-2`}
        >
          <div className="uppercase mb-2 font-medium">Offering</div>
          <div className="flex">
            <input
              type="text"
              name="fromAmount"
              id="fromAmount"
              value={values.fromAmount}
              onChange={(e) =>
                handleNumericInput(e, setValues, selectedFromToken.decimals)
              }
              // use toLocaleString() for comma formatting
              autoComplete="off"
              className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus:border-none"
              placeholder="Enter Amount"
              onFocus={() =>
                setActiveInput({ fromInput: true, toInput: false })
              }
              onBlur={() =>
                setActiveInput({ fromInput: false, toInput: false })
              }
            />
            <div className="w-1/4">
              <TokenDropdown
                selected={selectedFromToken}
                setSelected={setSelectedFromToken}
              />
            </div>
          </div>
          <div>
            Balance:{" "}
            {!auth ? (
              "N/A"
            ) : tokenObjects === null ? (
              "N/A"
            ) : (
              <button
                type="button"
                className={` ${!auth ? "text-transparent hover:cursor-default" : "text-white"} text-sm pt-2`}
                onClick={() =>
                  setValues({
                    fromAmount: convertIntToFloat(
                      balances.from_balance.toString(),
                      selectedFromToken.decimals,
                    ),
                    toAmount: values.toAmount,
                    inputExchangeRate: "",
                  })
                }
              >
                {formatNumber(
                  Number(
                    convertIntToFloat(
                      balances.from_balance.toString(),
                      selectedFromToken.decimals,
                    ),
                  ),
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="absolute -mt-5 text-white bg-verto_bg ring-1 rounded-md ring-verto_border p-2 hover:ring-2"
            onClick={swapTradingPair}
          >
            <ArrowsUpDownIcon className="h-6 w-6" />
          </button>
        </div>
        <div
          className={`flex flex-col my-2 py-4 px-4 w-full rounded-lg  justify-between ring-1 focus-within:ring-2 ${!auth || noFor ? "ring-verto_border ring-1 hover:ring-2" : validFor ? "ring-lime-400 ring-2" : "ring-red-600 ring-2 focus-within:ring-red-600"}`}
        >
          <div className="uppercase mb-2 font-medium">For</div>
          <div className="flex ">
            <input
              type="text"
              name="toAmount"
              id="toAmount"
              value={values.toAmount}
              onChange={(e) =>
                handleNumericInput(e, setValues, selectedToToken.decimals)
              }
              // onChange={(e) => handleInput(e, 'to')}
              autoComplete="off"
              className="w-3/4 p-0 text-4xl bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus:border-none"
              placeholder="Enter Amount"
              onFocus={() =>
                setActiveInput({ fromInput: false, toInput: true })
              }
              onBlur={() =>
                setActiveInput({ fromInput: false, toInput: false })
              }
            />
            <div className="w-1/4">
              <TokenDropdown
                selected={selectedToToken}
                setSelected={setSelectedToToken}
              />
            </div>
          </div>
          <div
            className={` ${!auth ? "text-transparent hover:cursor-default" : "text-white"} text-sm pt-2`}
          >
            Balance:{" "}
            {!auth
              ? "N/A"
              : tokenObjects === null ||
                  tokenObjects[selectedToToken.contractId] === undefined
                ? "N/A"
                : formatNumber(
                    Number(
                      convertIntToFloat(
                        balances.to_balance.toString(),
                        tokenObjects[selectedToToken.contractId].decimals,
                      ),
                    ),
                  )}
          </div>
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
                            type="text"1X

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
        {!auth ? (
          <button
            type="button"
            onClick={signIn}
            className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 hover:to-lime-200 mt-2 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Connect Wallet to Create Order
          </button>
        ) : (
          <div className="flex justify-between py-2">
            <button
              type="button"
              onClick={() => handleMultiple()}
              className={
                Multiple === 1
                  ? "py-2.5 px-3 mr-2 w-20 rounded-md text-sm font-semibold ring-verto_border shadow-sm ring-1 hover:ring-2"
                  : validMultiple && Multiple > 1
                    ? "py-2.5 px-3 mr-2 w-20 rounded-md text-sm font-semibold ring-lime-400 ring-2"
                    : "py-2.5 px-3 mr-2 w-20 rounded-md text-sm font-semibold ring-red-500 ring-2"
              }
            >
              {Multiple}X {maxClicked ? <></> : <></>}
            </button>
            <button
              type="submit"
              className={
                validOrder
                  ? "w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 hover:to-lime-200  text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  : "w-full rounded-md bg-gradient-to-r from-slate-800 hover:cursor-default to-slate-600 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              }
              disabled={!validOrder}
            >
              Create Order
            </button>
          </div>
        )}
        <div className="flex flex-col py-4 px-4 w-full rounded-lg mb-2 mt-2 justify-between ring-1 ring-verto_border">
          <div className="font-semibold mb-2">EXCHANGE RATE</div>
          {values.fromAmount && values.toAmount ? (
            <div className=" text-3xl flex">
              <span> 1 {selectedFromToken.symbol} ⇌ </span>
              <div className="px-1">
                {numSlice(
                  parseFloat(values.toAmount) / parseFloat(values.fromAmount),
                )}
              </div>
              {selectedToToken.symbol}
            </div>
          ) : (
            <div className="text-transparent hover:cursor-default">N/A</div>
          )}
        </div>
      </form>
    </div>
  );
}
