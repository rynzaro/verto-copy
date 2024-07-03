"use client";

import { VertoContract } from "@/lib/config/near";
import { Order, TokenMetadata } from "@/lib/types/types";
import { convertIntToFloat, handleInput, truncateString } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, Key, useEffect, useState } from "react";
import Image from "next/image";
import { MethodParameters } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { Input } from "@headlessui/react";
import FilterForm from "./forms/FilterForm";

const TAKE_OFFER_TGAS = "300000000000000";

export default function GetOrders({
  typeOfOrders,
  heading,
}: {
  typeOfOrders: string;
  heading: string;
}) {
  const tokenObjects = useFetchTokenObjects();
  const CONTRACT = VertoContract;
  const { viewMethod, callMethod, accountId, callMethods, status } = useNearWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    setFilteredOrders(orders)
  }, [orders])

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

  function handleFill(order: Order) {
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

  function handleCancel(order: Order) {
    callMethod({
      contractId: VertoContract,
      method: 'cancel_order',
      args: { order_id: order.id },
      gas: TAKE_OFFER_TGAS,
      deposit: '1',
    })
  }

  function handleClaim(order: Order) {
    console.log("claim order");
  }

  function getOrderButton(order: Order) {
    let button = <></>;
    let state = order.status;
    let buttonClass =
      "rounded-md bg-gradient-to-r from-green-400 to-lime-300 w-[60px] hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

    if (status === 'unauthenticated') {
      return
    }

    if (state == "Open" && order.maker_id === accountId) {
      return (
        <button onClick={() => handleCancel(order)} className={buttonClass}>
          Cancel
        </button>
      );
    }

    if (state == "Open" && order.taker_id === null) {
      return (
        <button onClick={() => handleFill(order)} className={buttonClass}>
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
        onClick={() => handleFill(order)}
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
  }

  if (!tokenObjects) {
    return(
      <div>LOADING</div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="w-4/5">
        <div className="block text-sm font-medium leading-6 text-verto_wt">
          {heading}
        </div>
        <div className="mt-2">
          <table className="border-collapse border-spacing-2 table-auto text-center w-full">
            <thead className="border-b-2">
              <tr>
                <th className="px-3 py-4">ID</th>
                <th className="px-3 py-4">Pair</th>
                <th className="px-3 py-4">Offering</th>
                <th className="px-3 py-4">For</th>
                <th className="px-3 py-4">Price</th>
                <th className="px-3 py-4">Creator</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="">
  
              {filteredOrders.map((order: Order, index: Key) => {
                let fromObject = tokenObjects[order.from_contract_id]
                let toObject = tokenObjects[order.to_contract_id]
                if (fromObject && toObject) {
                  let fromAmountFloat = Number(convertIntToFloat(order.from_amount, fromObject.decimals))
                  let toAmountFloat = Number(convertIntToFloat(order.to_amount, toObject.decimals))
                  return (
                    <tr key={index} className="my-2 border-b border-gray-700">
                      <td className="py-4">{order.id}</td>
                      <td className="py-4 flex items-center justify-center">
                        <Image src={fromObject.icon} alt={fromObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover -mr-1 border-zinc-400 border-2" aria-hidden="true" />
                        <Image src={toObject.icon} alt={toObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover border-zinc-400 border-2" aria-hidden="true" />
                      </td>
                      <td className="py-4">
                        <p className="font-bold inline">{convertIntToFloat(order.from_amount, fromObject.decimals)}</p>
                        <span className="text-gray-500"> {truncateString(fromObject.symbol, 4)}</span>
                      </td>
                      <td className="py-4">
                        <p className="font-bold inline">{convertIntToFloat(order.to_amount, toObject.decimals)}</p>
                        <span className="text-gray-500"> {truncateString(toObject.symbol, 4)}</span>
                      </td>
                      <td className="py-4">
                        <p className="font-bold inline">{parseFloat((toAmountFloat / fromAmountFloat).toFixed(4))}</p>
                      </td>
                      <td className="py-4">
                        <p className="font-bold">{truncateString(order.maker_id, 8)} </p>
                      </td>
                      <td>{order.status}</td>
                      <td className="py-4">{getOrderButton(order)}</td>
                    </tr>
                  );
                } else {
                  return (<></>)
                }
              })}
            </tbody>
          </table>
        </div>
        <FilterForm
          orderObjects={orders}
          setFilteredOrders={setFilteredOrders}
          tokenObjects = {tokenObjects}
        />
      </div>
    </div>

  );
}