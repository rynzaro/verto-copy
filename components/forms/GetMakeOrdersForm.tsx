"use client";

import { Order } from "@/lib/types/types";
import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, useEffect, useState } from "react";
import OrderOverview from "../OrderOverview";
import { VertoContract } from "@/lib/config/near";

export default function GetMakeOrdersForm() {
  const CONTRACT = VertoContract;
  const { viewMethod } = useNearWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [values, setValues] = useState({
    account_id: "",
  });

  useEffect(() => {
    console.log(orders);
  }, [orders]);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();

    viewMethod({
      contractId: CONTRACT,
      method: "get_make_order_objects",
      args: { account_id: values.account_id },
    })
      .then((orders) => setOrders(orders))
      .catch((error) => {
        console.log(error);
        setOrders([]);
      });
  };

  return (
    <div className="order-form">
      <form onSubmit={submitForm}>
        <div>
          <label
            htmlFor="account_id"
            className="block text-sm font-medium leading-6 text-white"
          >
            Get Make Orders
          </label>
          <div className="mt-2">
            <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
              <input
                type="text"
                name="account_id"
                id="account_id"
                className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                onChange={(e) => handleInput(e, setValues)}
                placeholder="Account ID"
              />
              <button
                type="submit"
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Get Orders
              </button>
            </div>
          </div>
        </div>
      </form>
      <div>
        {orders.map((order) => {
          return <OrderOverview key={order.id} order={order} />;
        })}
      </div>
    </div>
  );
}
