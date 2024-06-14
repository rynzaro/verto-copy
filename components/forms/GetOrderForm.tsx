"use client";

import { Order } from "@/lib/types/types";
import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, useEffect, useState } from "react";
import OrderOverview from "../OrderOverview";
import { VertoContract } from "@/lib/config/near";

export default function GetOrderForm() {
  const CONTRACT = VertoContract;
  const { viewMethod } = useNearWallet();
  const [order, setOrder] = useState<Order | null>(null);
  const [values, setValues] = useState({
    id: "",
  });

  useEffect(() => {
    console.log(order);
  }, [order]);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();

    viewMethod({
      contractId: CONTRACT,
      method: "get_order",
      args: { id: values.id },
    })
      .then((order) => setOrder(order))
      .catch((error) => {
        console.log(error);
        setOrder(null);
      });
  };

  return (
    <div className="order-form">
      <form onSubmit={submitForm}>
        <div>
          <label
            htmlFor="id"
            className="block text-sm font-medium leading-6 text-white"
          >
            Get Order Information
          </label>
          <div className="mt-2">
            <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
              <input
                type="text"
                name="id"
                id="id"
                className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                onChange={(e) => handleInput(e, setValues)}
                placeholder="Order ID"
              />
              <button
                type="submit"
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Get Order Info
              </button>
            </div>
          </div>
        </div>
      </form>
      {order ? <OrderOverview key={order.id} order={order} /> : <></>}
    </div>
  );
}
