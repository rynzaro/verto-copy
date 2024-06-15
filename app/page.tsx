"use client";

import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState } from "react";
import { MethodParameters } from "@/lib/types/types";
import TokenDropdown from "@/components/TokenDropdown";

const CREATE_OFFER_TGAS = "300000000000000";
const MAX_GAS = "300000000000000";

export default function TradeOrderForm() {
  const { accountId, callMethod, callMethods, viewMethod, signIn, status } =
    useNearWallet();

  //
  // // CONTRACT TYPE OPTIONS
  //

  const [typePrivate, setType] = useState(false);
  const changeType = () => {
    setType((previousType) => !previousType);
  };

  const [fillSingle, fillSet] = useState(true);
  const changeFill = () => {
    fillSet((previousFill) => !previousFill);
  };

  //
  // // DROPDOWN MENUS
  //

  const TokensDropdown = [
    { label: "NEAR", value: "near" },
    { label: "USDC", value: "usdc.fakes.testnet" },
    { label: "AURORA", value: "aurora.fakes.testnet" },
    { label: "ETH", value: "eth.fakes.testnet" },
  ];

  //
  // // CONTRACT DATA
  //

  const [values, setValues] = useState({
    from_contract_id: "",
    to_contract_id: "",
    from_amount: "",
    to_amount: "",
  });

  //
  // // SET FROM_AMOUNT DECIMALS
  //

  const [DECIMALS_FROM, setDecimalsFrom] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const meta = await viewMethod({
        contractId: values.from_contract_id,
        method: "ft_metadata",
      });
      setDecimalsFrom(meta.decimals);
    };
    fetchData();
  }, [values.from_contract_id]);

  //
  // // SET TO_AMOUNT DECIMALS
  //

  const [DECIMALS_TO, setDecimalsTo] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const meta = await viewMethod({
        contractId: values.to_contract_id,
        method: "ft_metadata",
      });
      setDecimalsTo(meta.decimals);
    };
    fetchData();
  }, [values.to_contract_id]);

  //
  // // BALANCE CHECK
  //

  // useEffect on change of from_contract_id
  // const [sufficientBalance, setSufficientBalance] = useState(true);
  // const BalanceCheck = () => {
  //   viewMethod({
  //     contractId: values.from_contract_id,
  //     method: "storage_balance_of",
  //     args: { accountId: accountId },
  //   }).then((balance) => {
  //     if (balance < values.from_amount) {
  //       setSufficientBalance(false);
  //     } else {
  //       setSufficientBalance(true);
  //     }
  //   });
  // };

  let transactions: MethodParameters[] = [];

  //
  // // SUBMIT FORM
  //

  const submitForm = (e: FormEvent) => {
    e.preventDefault();

    if (values.to_amount.indexOf(".") !== -1) {
      const split_famount = values.to_amount.split(".");
      values.to_amount =
        split_famount[0] + split_famount[1].padEnd(DECIMALS_TO, "0");
    } else {
      values.to_amount = values.to_amount + "".padEnd(DECIMALS_TO, "0");
    }

    if (values.from_amount.indexOf(".") !== -1) {
      const split_famount = values.from_amount.split(".");
      values.from_amount =
        split_famount[0] + split_famount[1].padEnd(DECIMALS_FROM, "0");
    } else {
      values.from_amount = values.from_amount + "".padEnd(DECIMALS_FROM, "0");
    }

    const jsonObject = {
      type: "make",
      to_contract_id: values.to_contract_id,
      from_contract_id: values.from_contract_id,
      to_amount: values.to_amount,
      to_account: null,
    };
    const jsonString = JSON.stringify(jsonObject);

    if (values.from_contract_id === "near") {
      callMethod({
        contractId: "verto.testnet",
        method: "make_order",
        args: { msg: jsonString },
        gas: CREATE_OFFER_TGAS,
        deposit: values.from_amount,
      });
    } else {
      viewMethod({
        contractId: values.to_contract_id,
        method: "storage_balance_of",
        args: {
          account_id: accountId,
        },
      }).then((balance) => {
        if (balance === null) {
          transactions.push({
            contractId: values.to_contract_id,
            method: "storage_deposit",
            args: {
              account_id: accountId,
              registration_only: true,
            },
            gas: MAX_GAS,
            deposit: "1000000000000000000000000",
          });
        }
        transactions.push({
          contractId: values.from_contract_id,
          method: "ft_transfer_call",
          args: {
            receiver_id: "verto.testnet",
            amount: values.from_amount,
            msg: jsonString,
          },
          gas: MAX_GAS,
          deposit: "1",
        });
        callMethods(transactions).catch((error) => console.log(error));
      });
    }
  };

  const handleFromContractSelect = (selectedOption: any) => {
    setValues((prevValues) => ({
      ...prevValues,
      from_contract_id: selectedOption.value, // Assuming href is the identifier or value you want to store
    }));
  };

  // Function to update to_contract_id
  const handleToContractSelect = (selectedOption: any) => {
    setValues((prevValues) => ({
      ...prevValues,
      to_contract_id: selectedOption.value, // Assuming href is the identifier or value you want to store
    }));
  };

  return (
    <div className="flex w-full items-center justify-center opacity-75">
      <form
        onSubmit={submitForm}
        className="pt-44 px-24 flex min-h-screen w-7/8 justify-center object-center"
      >
        <div className=" p-2 h-5/6 flex flex-col justify-around w-tradeWindow">
          <div className="text-4xl font-semibold pb-5 pl-2">Trade Details</div>
          <div className="flex flex-col bg-verto_bg py-4 px-4 w-full rounded-lg mb-2 justify-between hover-inset-border2 border-verto_borders border-2">
            <div className="text-lg font-bold">OFFERING</div>
            <div className="flex">
              <input
                type="text"
                name="from_amount"
                id="from_amount"
                onChange={(e) => handleInput(e, setValues)}
                className="focus:outline-none w-3/4 text-4xl bg-verto_bg placeholder:font-semibold placeholder:text-zinc-700 text-verto_wt"
                placeholder="Enter Amount"
              />
              {/* <input
                type="text"
                name="from_contract_id"
                id="from_contract_id"
                onChange={(e) => handleInput(e, setValues)}
                className="w-1/3 rounded-lg bg-verto_bg border-2 border-verto_borders font-bold p-4 placeholder:text-verto_wt text-xl text-verto_wt focus:outline-none hover-inset-border2"
                placeholder="Select Token"
              /> */}

              <TokenDropdown
                label="Select Token"
                options={TokensDropdown}
                onSelect={handleFromContractSelect}
              />
            </div>
            <div className="flex justify-between text-sm mt-1 text-verto_wt font-normal">
              <div>$-</div>
              <div>Balance: -</div>
            </div>
          </div>
          <div className="flex flex-col bg-verto_bg py-4 px-4 w-full rounded-lg mb-2 justify-between hover-inset-border2 border-verto_borders border-2">
            <div className="text-lg font-bold">FOR</div>
            <div className="flex ">
              <input
                type="text"
                name="to_amount"
                id="to_amount"
                onChange={(e) => handleInput(e, setValues)}
                className="focus:outline-none placeholder:font-semibold w-3/4 text-4xl bg-verto_bg  placeholder:text-zinc-700 text-verto_wt"
                placeholder="Enter Amount"
              />
              {/* <input
                type="text"
                name="to_contract_id"
                id="to_contract_id"
                onChange={(e) => handleInput(e, setValues)}
                className="w-1/3 rounded-lg bg-verto_bg border-2 border-verto_borders font-bold p-4 placeholder:text-verto_wt text-xl text-verto_wt focus:outline-none hover-inset-border2"
                placeholder="Select Token"
              /> */}
              <TokenDropdown
                label="Select Token"
                options={TokensDropdown}
                onSelect={handleToContractSelect}
              />
            </div>
            <div className="flex justify-between text-sm mt-1 text-verto_wt font-normal">
              <div>$-</div>
              <div>Balance: -</div>
            </div>
          </div>
          <div className="mb-1">
            <div className="flex border-2 hover-inset-border2 border-verto_borders py-1 w-full rounded-lg justify-around mb-1">
              <button
                type="button"
                onClick={changeFill}
                className=" w-1/2 rounded-l-md mx-1 hover:bg-gradient-to-r from-vblue to-lime-400 hover:text-black"
              >
                {fillSingle ? <b>SINGLE</b> : <b>PARTIAL</b>}
              </button>
              <button
                type="button"
                onClick={changeType}
                className=" w-1/2 hover:box-shadow bg-verto_bg rounded-r-md mx-1 py-2 hover:bg-gradient-to-r from-vblue to-lime-400  hover:text-black"
              >
                {typePrivate ? <b>PRIVATE</b> : <b>PUBLIC</b>}
              </button>
            </div>
            {typePrivate ? (
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
            <div className="w-full">
              <button
                type="button"
                onClick={signIn}
                className="transition-bg hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 w-full rounded-xl  bg-gradient-to-r from-vblue to-lime-400 px-3 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <b> CONNECT WALLET</b>
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="text-bold text-xl transition-bg hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 w-full rounded-lg  bg-gradient-to-r from-vblue to-lime-400 px-3 py-3 font-semibold text-zinc-900 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              CREATE ORDER
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
