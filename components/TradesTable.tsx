"use client";

import { VertoContract } from "@/lib/config/near";
import { Order, TokenMetadata } from "@/lib/types/types";
import { convertFloatToInt, convertIntToFloat, handleInput, truncateString } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, Key, useEffect, useState } from "react";
import Image from "next/image";
import { MethodParameters } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { Input } from "@headlessui/react";
import { Field, Label, Switch } from '@headlessui/react'
import FilterForm from "./forms/FilterForm";
import { ArrowUpRightIcon, ArrowDownRightIcon, ArrowsUpDownIcon } from '@heroicons/react/20/solid'
import OrderPopup from "./OrderPopup";
import clsx from "clsx";

const TAKE_OFFER_TGAS = "300000000000000";

export default function GetOrders({
  typeOfOrders,
  heading,
  showCompletedToggle,
}: {
  typeOfOrders: string;
  heading: string;
  showCompletedToggle: boolean;
}) {
  const tokenObjects = useFetchTokenObjects();
  const CONTRACT = VertoContract;
  const { viewMethod, callMethod, accountId, callMethods, status } = useNearWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortOffer, setSortOffer] = useState(0);
  const [sortFor, setSortFor] = useState(0);
  const [succesful, setSuccesful] = useState(false);
  const [failed, setFailed] = useState(false);
  const [action, setAction] = useState("");
  const [orderPopupOpen, setOrderPopupOpen] = useState(false)
  const [currentOrderDetails, setCurrentOrderDetails] = useState<Order | null>(null)

  const cycleSort = (setStateFunction: Function) => {
    setStateFunction((prevState: number) => (prevState + 1) % 3)
  }

  // const resetSort = (setStateFunction: Function) => {
  //   setStateFunction((prevState: number) => 0)
  // }

  let sortIconOffer;
  switch (sortOffer) {
    case 0:
      sortIconOffer = <ArrowsUpDownIcon className="h-6 w-6 pr-2" />;
      break;
    case 1:
      sortIconOffer = <ArrowUpRightIcon className="h-6 w-6 pr-2" />;
      break;
    case 2:
      sortIconOffer = <ArrowDownRightIcon className="h-6 w-6 pr-2" />;
      break;
    default:
      sortIconOffer = <ArrowsUpDownIcon className="h-6 w-6 pr-2" />;
  }

  let sortIconFor;
  switch (sortFor) {
    case 0:
      sortIconFor = <ArrowsUpDownIcon className="h-6 w-6 pr-2" />;
      break;
    case 1:
      sortIconFor = <ArrowUpRightIcon className="h-6 w-6 pr-2" />;
      break;
    case 2:
      sortIconFor = <ArrowDownRightIcon className="h-6 w-6 pr-2" />;
      break;
    default:
      sortIconFor = <ArrowsUpDownIcon className="h-6 w-6 pr-2" />;
  }

  useEffect(() => {
    // resetSort(setSortOffer)
    setSortOffer(0)
    setSortFor(sortFor)
  }, [sortFor])

  useEffect(() => {
    setSortFor(0)
    setSortOffer(sortOffer)
  }, [sortOffer])


  const sortOrders = (orders: Order[], sortBy: 'from_amount' | 'to_amount', ascending: Boolean) => {

    // Use Array.prototype.sort() with a comparator function
    setFilteredOrders(orders.slice().sort((a, b) => {
      if (
        !tokenObjects ||
        (tokenObjects[a.from_contract_id] === undefined)
        || (tokenObjects[b.from_contract_id] === undefined)
        || (tokenObjects[b.to_contract_id] === undefined)
        || (tokenObjects[b.to_contract_id] === undefined)
      ) {
        return 0
      }
      const a_decimals = (sortBy === 'from_amount') ? tokenObjects[a.from_contract_id].decimals : tokenObjects[a.to_contract_id].decimals
      const b_decimals = (sortBy === 'from_amount') ? tokenObjects[b.from_contract_id].decimals : tokenObjects[b.to_contract_id].decimals
      const a_float = parseFloat(convertIntToFloat(a[sortBy], a_decimals))
      const b_float = parseFloat(convertIntToFloat(b[sortBy], b_decimals))
      return ascending ? (a_float - b_float) : -(a_float - b_float);
    }));
  };


  useEffect(() => {
    switch (sortFor) {
      case 0:
        setFilteredOrders(orders);
        break;
      case 1:
        sortOrders(orders, 'to_amount', true);
        break;
      case 2:
        sortOrders(orders, 'to_amount', false);
        break;
    }
  }, [orders, sortFor])

  useEffect(() => {
    switch (sortOffer) {
      case 0:
        setFilteredOrders(orders);
        break;
      case 1:
        sortOrders(orders, 'from_amount', true);
        break;
      case 2:
        sortOrders(orders, 'from_amount', false);
        break;
    }
  }, [orders, sortOffer])

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

  async function handleFill(order: Order) {
    const jsonObject = {
      type: "take",
      id: order.id,
    };

    let transactions: MethodParameters[] = [];
    let storage_balance = null
    const jsonString = JSON.stringify(jsonObject);

    if (order.to_contract_id === "near") {
      console.log('in near', jsonString)
      callMethod({
        contractId: VertoContract,
        method: "take_order",
        args: { msg: jsonString },
        gas: TAKE_OFFER_TGAS,
        deposit: order.to_amount,
      });
    } else {
      if (order.from_contract_id !== "near") {
        storage_balance = await viewMethod({
          contractId: order.from_contract_id,
          method: "storage_balance_of",
          args: {
            account_id: accountId,
          },
        })
      }

      if ((storage_balance === null) && (order.from_contract_id !== "near")) {

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

      callMethods(transactions).catch((error) => console.log(error))
        .catch((error) => console.log(error))
        .then((message) => {
          setAction("Fill");
          if (message === undefined) {
            setSuccesful(false)
            setFailed(true);
            return;
          }
          setSuccesful(true)
          setFailed(false);
          setFilteredOrders(orders)
          return;
        })

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
      .catch((error) => console.log(error))
      .then((message) => {
        setAction("Cancel");
        if (message === undefined) {
          setSuccesful(false)
          setFailed(true);
          return;
        }
        setSuccesful(true)
        setFailed(false);
        setFilteredOrders(orders)
        return;
      })
  }

  function handleClaim(order: Order) {
    console.log("claim order");
  }

  function getOrderButton(order: Order | null) {
    let button = <></>;
    if (order === null) {
      return <></>
    }
    let state = order.status;
    let buttonClass =
      "w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 w-[60px] hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

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
        className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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

  function showOrderDetails(order: Order) {
    setCurrentOrderDetails(order)
    setOrderPopupOpen(true)
  }


  if (!tokenObjects) {
    return (
      <div>LOADING</div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center ">
      <div className={clsx(
        'fixed inset-0 flex items-center justify-center z-50',
        { 'hidden': !orderPopupOpen }
      )}>
        <div className = "p-5 bg-gray-900">
          <OrderPopup
            order={currentOrderDetails}
            close={() => setOrderPopupOpen(false)}
            tokenObjects={tokenObjects}
            orderActionButton = {getOrderButton(currentOrderDetails)}

          />
        </div>

      </div>
      <div className="w-4/5">
        <div className="mt-4">
          <FilterForm
            orderObjects={orders}
            setFilteredOrders={setFilteredOrders}
            tokenObjects={tokenObjects}
            showCompletedToggle={showCompletedToggle}
          />
        </div>

        <div>
          {succesful ?
            <div className="flex items-center p-4 my-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800 fixed bottom-5 w-4/5" role="alert">
              <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div>
                <span className="font-medium">{action}ing Order succesful!</span>
              </div>
              <button onClick={() => setSuccesful(false)} className="ml-auto bg-green-50 text-green-800 rounded-lg focus:ring-2 focus:ring-green-400 p-1 hover:bg-red-200 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 14">
                  <path d="M10.833 3.833L7 7.667m0 0L3.167 3.833m3.833 3.834L3.167 10.5m3.833-3.833L10.833 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            : <></>
          }

          {failed ?
            <div className="flex items-center p-4 my-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800 fixed bottom-5 w-4/5" role="alert">
              <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div>
                <span className="font-medium">The process was interrupted or the action was not submitted.</span>
              </div>
              <button onClick={() => setFailed(false)} className="ml-auto bg-red-50 text-red-800 rounded-lg focus:ring-2 focus:ring-red-400 p-1 hover:bg-red-200 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 14">
                  <path d="M10.833 3.833L7 7.667m0 0L3.167 3.833m3.833 3.834L3.167 10.5m3.833-3.833L10.833 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            : <></>
          }
        </div>
        <div className="block text-sm font-medium leading-6 text-verto_wt">
          {heading}
        </div>
        <div className="mt-2">
          <table className="border-collapse border-spacing-2 table-auto text-center w-full">
            <thead className="border-b-2">
              <tr>
                <th className="px-3 py-4">Pair</th>
                <th className="px-3 py-4">
                  <button onClick={() => cycleSort(setSortOffer)} className="hover:bg-zinc-700 rounded-md px-3 py-2">
                    {<span className="flex"> {sortIconOffer}
                      Offering</span>}
                  </button>
                </th>
                <th className="px-3 py-4">
                  <button onClick={() => cycleSort(setSortFor)} className="hover:bg-zinc-700 rounded-md px-3 py-2">
                    <span className="flex"> {sortIconFor}
                      For</span>
                  </button>
                </th>
                <th className="px-3 py-4 hidden md:table-cell">Price</th>
                <th className="px-3 py-4 hidden md:table-cell">Creator</th>
                <th className="px-3 py-4 hidden md:table-cell">Status</th>
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
                      <td className="py-4 flex items-center justify-center">
                        <Image src={fromObject.icon} alt={fromObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover -mr-1 border-zinc-400 border-2" aria-hidden="true" />
                        <Image src={toObject.icon} alt={toObject.name} height={20} width={20} className="h-8 w-8 rounded-full object-cover border-zinc-400 border-2" aria-hidden="true" />
                      </td>
                      <td className="py-4">
                        <p className="font-bold inline">{convertIntToFloat(order.from_amount, fromObject.decimals)}</p>
                        <span className="text-gray-500"> {truncateString(fromObject.symbol, 4)}</span>
                      </td>
                      <td className="py-4 ">
                        <p className="font-bold inline">{convertIntToFloat(order.to_amount, toObject.decimals)}</p>
                        <span className="text-gray-500"> {truncateString(toObject.symbol, 4)}</span>
                      </td>
                      <td className="py-4 hidden md:table-cell">
                        <p className="font-bold inline">{parseFloat((toAmountFloat / fromAmountFloat).toFixed(4))}</p>
                      </td>
                      <td className="py-4 hidden md:table-cell">
                        <p className="font-bold">{truncateString(order.maker_id, 8)} </p>
                      </td>
                      <td className="hidden md:table-cell">{order.status}</td>
                      <td className="py-4">
                        <button
                          type='button'
                          className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                          onClick={
                            () => { showOrderDetails(order) }
                          }
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                } else {
                  return (<></>)
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div >

  );
}