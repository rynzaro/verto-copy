"use client";

import { Order } from "@/lib/types/types";
import { handleInput } from "@/lib/utils";
import { VertoContract } from "@/lib/config/near";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, useEffect, useState } from "react";
import OrderOverview from "../OrderOverview";

const THIRTY_TGAS = "30000000000000";
const CREATE_OFFER_TGAS = "300000000000000";

export default function CreateOrderForm() {
  const CONTRACT = VertoContract;
  const { callMethod } = useNearWallet();
  const [values, setValues] = useState({
    from_contract_id: "",
    to_contract_id: "",
    from_amount: "",
    to_amount: "",
  });

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    const jsonObject = {
      type: "make",
      to_contract_id: values.to_contract_id,
      to_amount: values.to_amount,
      to_account: null,
    };

    const jsonString = JSON.stringify(jsonObject);

    if (values.from_contract_id === "near") {
      callMethod({
        contractId: VertoContract,
        method: "make_order",
        args: { msg: jsonString },
        gas: CREATE_OFFER_TGAS,
        deposit: values.from_amount,
      });
    } else {
      callMethod({
        contractId: values.from_contract_id,
        method: "ft_transfer_call",
        args: {
          receiver_id: VertoContract,
          amount: values.from_amount,
          memo: null,
          msg: jsonString,
        },
        gas: CREATE_OFFER_TGAS,
        deposit: "1",
      });
    }
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
                  name="from_contract_id"
                  id="from_contract_id"
                  className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  onChange={(e) => handleInput(e, setValues)}
                  placeholder="From Contract ID"
                />
              </div>
              <div className="col-span-3 flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input
                  type="text"
                  name="from_amount"
                  id="from_amount"
                  className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  onChange={(e) => handleInput(e, setValues)}
                  placeholder="From Amount"
                />
              </div>
              <div className="col-span-3 flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input
                  type="text"
                  name="to_contract_id"
                  id="to_contract_id"
                  className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  onChange={(e) => handleInput(e, setValues)}
                  placeholder="To Contract ID"
                />
              </div>
              <div className="col-span-3 flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input
                  type="text"
                  name="to_amount"
                  id="to_amount"
                  className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  onChange={(e) => handleInput(e, setValues)}
                  placeholder="To Amount"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="rounded-md w-full bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
