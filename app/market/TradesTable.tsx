"use client";

import { VertoContract } from "@/lib/config/near";
import { Order } from "@/lib/types/types";
import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, Key, useEffect, useState } from "react";
import { MethodParameters } from "@/lib/types/types";

const TAKE_OFFER_TGAS = "300000000000000";

export default function GetOrders({
  typeOfOrders,
  heading,
}: {
  typeOfOrders: string;
  heading: string;
}) {
  const CONTRACT = VertoContract;
  const { viewMethod, callMethod, accountId, callMethods, status } = useNearWallet();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let method = "";
    switch (typeOfOrders) {
      case "all":
        method = "get_orders";
        break;
      case "open":
        method = "get_public_open_orders";
        break;
      case "claimable":
        method = "get_claimable_orders";
        break;
      case "offers":
        method = "get_offers";
        break;
      case "make":
        method = "get_make_orders";
        break;
      case "take":
        method = "get_take_orders";
        break;
      case "completed":
        method = "get_completed_orders";
        break;
      default:
        return;
    }

    viewMethod({
      contractId: CONTRACT,
      method: method,
      args: { account_id: accountId },
    })
      .then((orders) => setOrders(orders))
      .catch((error) => {
        console.log(error);
        setOrders([]);
      })
      .catch((error) => console.log(error));
  }, [accountId, CONTRACT, viewMethod, typeOfOrders]);

  function getOrderButton(order: Order) {
    let button = <></>;
    let state = order.status;
    let buttonClass =
      "inline-flex items-center gap-x-1.5 rounded-md bg-gradient-to-r from-green-400 to-lime-300  hover:from-green-300 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

    if (status === 'unauthenticated') {
      return
    }

    if (state == "Open" && order.maker_id === accountId) {
      return
    }

    if (state == "Open" && order.taker_id === null) {
      return (
        <button onClick={() => handleClick(order)} className={buttonClass}>
          Fill
        </button>
      );
    }

    if (state == "Open" && order.taker_id === accountId) {
      return (
        <button onClick={() => handleFill(order)} className={buttonClass}>
          Fill
        </button>
      );
    }
    order.status === "Open" ? (
      <button
        onClick={() => handleClick(order)}
        className="w-full rounded-md bg-gradient-to-r from-vblue to-lime-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        Fill
      </button>
    ) : (
      <></>
    );
    if (state == "Claimable" && order.maker_id === accountId) {
      return (
        <button onClick={() => handleClaim(order)} className={buttonClass}>
          Claim
        </button>
      );
    }

    function handleFill(order: Order) {
      console.log("fill order");
    }

    function handleClaim(order: Order) {
      console.log("claim order");
    }

    function handleClick(order: Order) {
      const jsonObject = {
        type: "take",
        id: order.id,
      };

      let transactions: MethodParameters[] = [];

      const jsonString = JSON.stringify(jsonObject);

      if (order.to_contract_id === "near") {
        callMethod({
          contractId: VertoContract,
          method: "take_order",
          args: { msg: jsonString },
          gas: TAKE_OFFER_TGAS,
          deposit: order.to_amount,
        });
      } else {
        viewMethod({
          contractId: order.from_contract_id,
          method: "storage_balance_of",
          args: {
            account_id: accountId,
          },
        }).then((balance) => {
          if (balance === null) {
            transactions.push({
              contractId: order.from_contract_id,
              method: "storage_deposit",
              args: {
                account_id: accountId,
                registration_only: true,
              },
              gas: TAKE_OFFER_TGAS,
              deposit: "100000000000000000000000",
            });
          }
          transactions.push({
            contractId: order.to_contract_id,
            method: "ft_transfer_call",
            args: {
              receiver_id: VertoContract,
              amount: order.to_amount,
              msg: jsonString,
            },
            gas: TAKE_OFFER_TGAS,
            deposit: "1",
          });
          callMethods(transactions).catch((error) => console.log(error));
        });
      }
    }
  }

  return (
    <>
      <div className="block text-sm font-medium leading-6 text-verto_wt">
        {heading}
      </div>
      <div className="mt-2">
        <table className="border-collapse border-spacing-2 table-auto text-center w-full">
          <thead className="border-b-2 border-verto_borders pb-4">
            <tr>
              <th className="px-3 py-4">ID</th>
              <th className="px-3 py-4">Trade Overview</th>
              <th className="px-3 py-4">Offering</th>
              <th className="px-3 py-4">For</th>
              <th className="px-3 py-4">Fill Type</th>
              <th className="px-3 py-4">Creator</th>
              <th className="px-3 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="border-b-2 border-verto_borders pb-4">
            {orders.map((order: Order, index: Key) => {
              return (
                <tr key={index} className="my-2">
                  <td className="py-4">{order.id}</td>
                  <td className="py-4"></td>
                  <td className="py-4">
                    <p className="font-bold inline">{order.from_amount}</p>
                    <span> {order.from_contract_id}</span>
                  </td>
                  <td className="py-4">
                    <p className="font-bold inline">{order.to_amount}</p>
                    <span> {order.to_contract_id}</span>
                  </td>
                  <td className="py-4"></td>
                  <td className="py-4">
                    <p className="font-bold">{order.maker_id} </p>
                  </td>
                  <td className="py-4">{getOrderButton(order)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}