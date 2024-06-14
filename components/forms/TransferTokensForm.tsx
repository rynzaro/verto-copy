"use client";

import { Order } from "@/lib/types/types";
import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, useEffect, useState } from "react";
import OrderOverview from "../OrderOverview";
import { VertoContract } from "@/lib/config/near";

const THIRTY_TGAS = "30000000000000";
const NO_DEPOSIT = "0";

export default function GetOrderForm() {
  const CONTRACT = VertoContract;
  const { callMethod } = useNearWallet();
  const [values, setValues] = useState({
    amount: "",
    receiver_id: "",
  });

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    callMethod({
      contractId: "ftfun.testnet",
      method: "ft_transfer",
      args: {
        amount: values.amount,
        receiver_id: values.receiver_id,
        memo: null,
      },
      gas: THIRTY_TGAS,
      deposit: "1",
    });
  };

  return (
    <div className="order-form">
      <form onSubmit={submitForm}>
        <div>
          <label
            htmlFor="receiver_id"
            className="block text-sm font-medium leading-6 text-white"
          >
            Send Transaction
          </label>
          <div className="mt-2">
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-3 flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input
                  type="text"
                  name="receiver_id"
                  id="receiver_id"
                  className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  onChange={(e) => handleInput(e, setValues)}
                  placeholder="Receiver ID"
                />
              </div>
              <div className="col-span-3 flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  onChange={(e) => handleInput(e, setValues)}
                  placeholder="Amount"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Transfer Tokens
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
