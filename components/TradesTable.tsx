"use client";

import { VertoContract } from "@/lib/config/near";
import { Checkbox } from "@headlessui/react";
import { FilterValues, Order, Sort } from "@/lib/types/types";
import {
  convertIntToFloat,
  convertIntToFloat_,
  formatNumber,
  truncateString,
} from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { Key, useEffect, useState } from "react";
import Image from "next/image";
import { MethodParameters } from "@/lib/types/types";
import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import FilterForm from "./forms/FilterForm";
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/20/solid";
import OrderPopup from "./OrderPopup";
import clsx from "clsx";

const TAKE_OFFER_TGAS = "300000000000000";

const sortOptions = ["price", "amountOffer", "amountFor", "id"] as const;

export default function GetOrders({
  typeOfOrders,
  heading,
  showCompletedToggle,
  showOrderStatus,
  initialSort,
  initialFilterValues,
}: {
  typeOfOrders: string;
  heading: string;
  showCompletedToggle: boolean;
  showOrderStatus: boolean;
  initialSort: Sort;
  initialFilterValues: FilterValues;
}) {
  const tokenObjects = useFetchTokenObjects();
  const CONTRACT = VertoContract;
  const { viewMethod, callMethod, accountId, callMethods, status } =
    useNearWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [succesful, setSuccesful] = useState(false);
  const [failed, setFailed] = useState(false);
  const [action, setAction] = useState("");
  const [orderPopupOpen, setOrderPopupOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<Order | null>(
    null
  );

  const [multipleOrders, setMultipleOrders] = useState(false);
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [sort, setSort] = useState<Sort>(initialSort);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    ...initialFilterValues,
  });

  function handleSort(orderBy: (typeof sortOptions)[number]) {
    setSort((prev) => {
      if (prev.value === orderBy && prev.order === "desc") {
        return initialSort;
      } else if (prev.value === orderBy && prev.order === "asc") {
        return {
          value: orderBy,
          order: "desc",
        };
      }
      return {
        value: orderBy,
        order: "asc",
      };
    });
  }

  function sortOrders(orders: Order[]) {
    // Use Array.prototype.sort() with a comparator function
    return orders.sort((a, b) => {
      if (
        !tokenObjects ||
        tokenObjects[a.from_contract_id] === undefined ||
        tokenObjects[a.to_contract_id] === undefined ||
        tokenObjects[b.from_contract_id] === undefined ||
        tokenObjects[b.to_contract_id] === undefined
      ) {
        return 0;
      }
      let valueA;
      let valueB;
      switch (sort.value) {
        case "price":
          valueA = parseFloat(a["to_amount"]) / parseFloat(a["from_amount"]);
          valueB = parseFloat(b["to_amount"]) / parseFloat(b["from_amount"]);
          break;

        case "amountOffer":
          let decimalsAOffer = tokenObjects[a.from_contract_id].decimals;
          let decimalsBOffer = tokenObjects[b.from_contract_id].decimals;
          valueA = parseFloat(
            convertIntToFloat(a["from_amount"], decimalsAOffer)
          );
          valueB = parseFloat(
            convertIntToFloat(b["from_amount"], decimalsBOffer)
          );
          break;

        case "amountFor":
          let decimalsAFor = tokenObjects[a.to_contract_id].decimals;
          let decimalsBFor = tokenObjects[b.to_contract_id].decimals;
          valueA = parseFloat(convertIntToFloat(a["to_amount"], decimalsAFor));
          valueB = parseFloat(convertIntToFloat(b["to_amount"], decimalsBFor));
          break;

        case "id":
          valueA = parseInt(a.id);
          valueB = parseInt(b.id);
          break;

        default:
          throw new Error(`Unsupported sort value: ${sort.value}`);
      }
      return sort.order === "asc" ? valueA - valueB : valueB - valueA;
    });
  }

  function filterOrders() {
    console.log("Actual Filter Values:", filterValues);
    if (!tokenObjects) {
      return;
    }
    const minFromAmount = filterValues.minFromAmount
      ? parseFloat(filterValues.minFromAmount)
      : -Infinity;
    const maxFromAmount = filterValues.maxFromAmount
      ? parseFloat(filterValues.maxFromAmount)
      : Infinity;
    const minToAmount = filterValues.minToAmount
      ? parseFloat(filterValues.minToAmount)
      : -Infinity;
    const maxToAmount = filterValues.maxToAmount
      ? parseFloat(filterValues.maxToAmount)
      : Infinity;
    const minPrice = filterValues.minPrice
      ? parseFloat(filterValues.minPrice)
      : -Infinity;
    const maxPrice = filterValues.maxPrice
      ? parseFloat(filterValues.maxPrice)
      : Infinity;

    const newOrderObjects = orders.filter((order: Order) => {
      if (
        !(
          tokenObjects[order.from_contract_id] &&
          tokenObjects[order.to_contract_id]
        )
      ) {
        return false;
      }

      // if both are set, to be filtered out neither must be correct
      if (filterValues.fromAccountId && filterValues.toAccountId) {
        if (accountId !== order.maker_id && accountId !== order.taker_id) {
          return false;
        }
        // if one is set, if it doesn't match, it's filtered out
      } else if (
        (filterValues.fromAccountId && accountId !== order.maker_id) ||
        (filterValues.toAccountId && accountId !== order.taker_id)
      ) {
        return false;
      }

      if (
        (filterValues.buyMept &&
          order.from_contract_id !== "pre.meteor-token.near") ||
        (!filterValues.buyMept &&
          order.from_contract_id === "pre.meteor-token.near")
      ) {
        return false;
      }

      const fromAmount = parseFloat(
        convertIntToFloat(
          order.from_amount,
          tokenObjects[order.from_contract_id].decimals
        )
      );
      const toAmount = parseFloat(
        convertIntToFloat(
          order.to_amount,
          tokenObjects[order.to_contract_id].decimals
        )
      );
      const price = toAmount / fromAmount;

      return (
        fromAmount >= minFromAmount &&
        fromAmount <= maxFromAmount &&
        toAmount >= minToAmount &&
        toAmount <= maxToAmount &&
        price >= minPrice &&
        price <= maxPrice &&
        (filterValues.showCompleted || order.status === "Open")
      );
    });

    setFilteredOrders(newOrderObjects);
  }

  useEffect(() => {
    filterOrders();
  }, [orders, filterValues.buyMept, filterValues.showCompleted]);

  useEffect(() => {
    viewMethod({
      contractId: CONTRACT,
      method: "get_orders",
      args: { account_id: accountId },
    })
      .then((orders) => setOrders(orders))
      .catch((error) => {
        console.log(error);
        setOrders([]);
      })
      .catch((error) => console.log(error));
  }, [accountId, CONTRACT, viewMethod, typeOfOrders]);

  const handleCheck = (order: Order) => {
    setTransactions((prevTransactions) => {
      if (prevTransactions.some((item) => item.id === order.id)) {
        const newTransactions = prevTransactions.filter(
          (item) => item.id !== order.id
        );
        console.log(newTransactions);
        return newTransactions;
      } else {
        const newTransactions = [...prevTransactions, order];
        console.log(newTransactions);
        return newTransactions;
      }
    });
  };

  useEffect(() => {
    setTransactions([]);
  }, [filterValues.buyMept]);

  async function handleMultiple(orders: Order[]) {
    let arr: MethodParameters[] = [];
    for (const order of orders) {
      const jsonObject = {
        type: "take",
        id: order.id,
      };

      let storage_balance = null;
      const jsonString = JSON.stringify(jsonObject);

      storage_balance = await viewMethod({
        contractId: order.from_contract_id,
        method: "storage_balance_of",
        args: {
          account_id: accountId,
        },
      });

      if (storage_balance === null && order.from_contract_id !== "near") {
        arr.push({
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

      arr.push({
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
    }

    callMethods(arr)
      .catch((error) => console.log(error))
      .then((message) => {
        setAction("Fill");
        if (message === undefined) {
          setSuccesful(false);
          setFailed(true);
          return;
        }
        setSuccesful(true);
        setFailed(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      });
  }

  const multipleDetails = () => {
    // declare Order that will be passed to the order display card function in the end
    let orderSummary: Order = {
      id: "",
      from_contract_id: "",
      to_contract_id: "",
      from_amount: "",
      to_amount: "",
      status: "",
      maker_id: "",
      taker_id: null,
    };
    if (!tokenObjects) {
      return orderSummary;
    }
    const arr: [
      string[],
      string[],
      string[],
      string[],
      string[],
      string[],
      string[],
      (string | null)[],
    ] = transactions.reduce(
      (acc, order) => {
        acc[0].push(order.id);
        acc[1].push(order.from_contract_id);
        acc[2].push(order.to_contract_id);
        acc[3].push(order.from_amount);
        acc[4].push(order.to_amount);
        acc[5].push(order.status);
        acc[6].push(order.maker_id);
        acc[7].push(order.taker_id);
        return acc;
      },
      [[], [], [], [], [], [], [], []] as [
        string[],
        string[],
        string[],
        string[],
        string[],
        string[],
        string[],
        (string | null)[],
      ]
    );

    // const arr = transactions.map((order) => [
    //   order.id,
    //   order.from_contract_id,
    //   order.to_contract_id,
    //   order.from_amount,
    //   order.to_amount,
    //   order.status,
    //   order.maker_id,
    //   order.taker_id,
    // ]);
    let from_sum = 0;
    let to_sum = 0;
    let i = 0;
    // for (let i = 0; i < arr[3].length; i++) {
    while (arr[3][i]) {
      from_sum = from_sum + parseInt(arr[3][i]);
      to_sum = to_sum + parseInt(arr[4][i]);
      i++;
    }

    orderSummary.id = arr[0].join(", ");
    orderSummary.from_contract_id = String(Array.from(new Set(arr[1]))[0]);
    orderSummary.to_contract_id = String(Array.from(new Set(arr[2]))[0]);
    orderSummary.from_amount = from_sum.toLocaleString("fullwide", {
      useGrouping: false,
    });
    orderSummary.to_amount = String(Array.from(new Set(arr[2]))[0]);
    orderSummary.to_amount = to_sum.toLocaleString("fullwide", {
      useGrouping: false,
    });
    orderSummary.status = "Open";
    orderSummary.maker_id = Array.from(new Set(arr[6])).join(", ");
    orderSummary.taker_id = arr[7][0];

    console.log(orderSummary);

    return orderSummary;
  };

  async function handleFill(order: Order) {
    const jsonObject = {
      type: "take",
      id: order.id,
    };

    let transactions: MethodParameters[] = [];
    let storage_balance = null;
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
      if (order.from_contract_id !== "near") {
        storage_balance = await viewMethod({
          contractId: order.from_contract_id,
          method: "storage_balance_of",
          args: {
            account_id: accountId,
          },
        });
      }

      if (storage_balance === null && order.from_contract_id !== "near") {
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

      callMethods(transactions)
        .catch((error) => console.log(error))
        .then((message) => {
          setAction("Fill");
          if (message === undefined) {
            setSuccesful(false);
            setFailed(true);
            return;
          }
          setSuccesful(true);
          setFailed(false);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        });
    }
  }

  function handleCancel(order: Order) {
    callMethod({
      contractId: VertoContract,
      method: "cancel_order",
      args: { order_id: order.id },
      gas: TAKE_OFFER_TGAS,
      deposit: "1",
    })
      .catch((error) => console.log(error))
      .then((message) => {
        setAction("Cancel");
        if (message === undefined) {
          setSuccesful(false);
          setFailed(true);
          return;
        }
        setSuccesful(true);
        setFailed(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      });
  }

  function handleClaim(order: Order) {
    console.log("claim order");
  }

  function getOrderButton(order: Order | null) {
    let button = <></>;
    if (order === null) {
      return <></>;
    }
    let state = order.status;
    let buttonClass =
      "w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 w-[60px] hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

    if (status === "unauthenticated") {
      return;
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
    setCurrentOrderDetails(order);
    setOrderPopupOpen(true);
  }

  if (!tokenObjects || (tokenObjects && !tokenObjects["gear.enleap.near"])) {
    return (
      <div className="h-[320px] flex justify-center items-center">
        <div className="">LOADING</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center text-white">
      <div
        className={clsx("fixed inset-0 flex items-center justify-center", {
          hidden: !orderPopupOpen,
        })}
      >
        <div className="p-3 pt-1 rounded-lg bg-zinc-800">
          <OrderPopup
            order={currentOrderDetails}
            close={() => setOrderPopupOpen(false)}
            tokenObjects={tokenObjects}
            orderActionButton={getOrderButton(currentOrderDetails)}
          />
        </div>
      </div>
      <div className="w-4/5 max-w-4xl">
        <div className="pt-4 flex justify-between">
          {/* <RefreshButton /> */}
          <FilterForm
            showCompletedToggle={showCompletedToggle}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            handleFilterOrders={filterOrders}
          />
          {multipleOrders ? (
            <>
              <div>
                <button
                  type="button"
                  onClick={() => showOrderDetails(multipleDetails())}
                  className={` rounded-md bg-gradient-to-r from-green-400 to-lime-300 h-full hover:from-green-300 px-3.5 py-2 mr-2 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
                >
                  Details
                </button>
                <button
                  onClick={() => {
                    setTransactions([]);
                    setMultipleOrders(false);
                  }}
                  type="button"
                  className={`px-3.5 py-2 mr-2 h-full shadow-sm rounded-md font-semibold bg-zinc-800 text-white focus:outline-none hover:bg-zinc-600`}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                className={`px-3.5 py-2 h-full shadow-sm rounded-md font-semibold bg-zinc-800 text-white focus:outline-none hover:bg-zinc-600`}
                type="button"
                onClick={() => setMultipleOrders(true)}
              >
                Select Multiple Orders
              </button>
            </>
          )}
        </div>

        {succesful ? (
          <div className="fixed bottom-5 self-center w-4/5 max-w-4xl ">
            <div
              className="flex items-center p-4 mb-4 text-sm rounded-lg  bg-gray-800 text-green-400"
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
                <span className="font-medium">
                  {action}ing Order succesful!
                </span>
              </div>
              <button
                onClick={() => setSuccesful(false)}
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
          </div>
        ) : (
          <></>
        )}

        {failed ? (
          <div className="fixed bottom-5 self-center w-4/5 max-w-4xl ">
            <div
              className="flex items-center p-4 mb-4 text-sm rounded-lg bg-gray-800 text-red-400 border-red-800 "
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
                <span className="font-medium">
                  The process was interrupted or the action was not submitted.
                </span>
              </div>
              <button
                onClick={() => setFailed(false)}
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
          </div>
        ) : (
          <></>
        )}
        <div className="block text-sm font-medium leading-6 text-verto_wt">
          {heading}
        </div>
        <div className="mt-2">
          <table className="border-collapse border-spacing-2 table-auto text-center w-full">
            <thead className="border-b-2">
              <tr className="gap-x-4">
                <th className="py-4">Pair</th>
                <th className="py-4 text-right">
                  <button
                    onClick={() => handleSort("amountOffer")}
                    className="px-3 rounded-md hover:bg-zinc-700 py-2"
                  >
                    {
                      <span className="flex">
                        {sort.value !== "amountOffer" ? (
                          <ArrowsUpDownIcon className="h-6 w-6 pr-2" />
                        ) : sort.order === "asc" ? (
                          <ArrowUpRightIcon className="h-6 w-6 pr-2" />
                        ) : (
                          <ArrowDownRightIcon className="h-6 w-6 pr-2" />
                        )}
                        Offering
                      </span>
                    }
                  </button>
                </th>
                <th className="py-4 pr-6 text-right">
                  <button
                    onClick={() => handleSort("amountFor")}
                    className="px-3 rounded-md hover:bg-zinc-700 py-2"
                  >
                    {
                      //   sortIconOffer = <ArrowsUpDownIcon className="h-6 w-6 pr-2" />;
                      //   break;
                      // case 1:
                      //   sortIconOffer = <ArrowUpRightIcon className="h-6 w-6 pr-2" />;
                      //   break;
                      // case 2:
                      //   sortIconOffer = <ArrowDownRightIcon className="h-6 w-6 pr-2" />;
                      //   break;
                      // default:
                      //   sortIconOffer = <ArrowsUpDownIcon className="h-6 w-6 pr-2" />;
                    }
                    <span className="flex">
                      {sort.value !== "amountFor" ? (
                        <ArrowsUpDownIcon className="h-6 w-6 pr-2" />
                      ) : sort.order === "asc" ? (
                        <ArrowUpRightIcon className="h-6 w-6 pr-2" />
                      ) : (
                        <ArrowDownRightIcon className="h-6 w-6 pr-2" />
                      )}
                      For
                    </span>
                  </button>
                </th>
                <th className="py-4 hidden md:table-cell">
                  <button
                    onClick={() => handleSort("price")}
                    className="px-3 rounded-md hover:bg-zinc-700 py-2"
                  >
                    <span className="flex">
                      {sort.value !== "price" ? (
                        <ArrowsUpDownIcon className="h-6 w-6 pr-2" />
                      ) : sort.order === "asc" ? (
                        <ArrowUpRightIcon className="h-6 w-6 pr-2" />
                      ) : (
                        <ArrowDownRightIcon className="h-6 w-6 pr-2" />
                      )}
                      Price
                    </span>
                  </button>
                </th>
                <th className="px-3 py-4 hidden md:table-cell">Creator</th>
                {showOrderStatus ? (
                  <th className="px-3 py-4 hidden md:table-cell">Status</th>
                ) : (
                  <></>
                )}
                {multipleOrders ? (
                  <th className="px-3 py-4"> Select </th>
                ) : (
                  <th className="px-3 py-4"> Action</th>
                )}
              </tr>
            </thead>

            <tbody className="">
              {sortOrders(filteredOrders).map((order: Order) => {
                let fromObject = tokenObjects[order.from_contract_id];
                let toObject = tokenObjects[order.to_contract_id];
                if (fromObject && toObject) {
                  let fromAmountFloat = Number(
                    convertIntToFloat(order.from_amount, fromObject.decimals)
                  );
                  let toAmountFloat = Number(
                    convertIntToFloat(order.to_amount, toObject.decimals)
                  );
                  return (
                    <tr key={order.id} className="border-b border-gray-700 ">
                      <td className="py-4 flex items-center justify-center">
                        <Image
                          src={fromObject.icon}
                          alt={fromObject.name}
                          height={20}
                          width={20}
                          className="h-8 w-8 rounded-full object-cover -mr-1 border-zinc-400 border-2"
                          aria-hidden="true"
                        />
                        <Image
                          src={toObject.icon}
                          alt={toObject.name}
                          height={20}
                          width={20}
                          className="h-8 w-8 rounded-full object-cover border-zinc-400 border-2"
                          aria-hidden="true"
                        />
                      </td>
                      <td className="py-4 text-right">
                        <p className="font-bold inline">
                          {formatNumber(
                            Number(
                              convertIntToFloat(
                                order.from_amount,
                                fromObject.decimals
                              )
                            )
                          )}
                        </p>
                        <span className="text-gray-500">
                          {" "}
                          {truncateString(fromObject.symbol, 4)}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <p className="font-bold inline">
                          {formatNumber(
                            Number(
                              convertIntToFloat(
                                order.to_amount,
                                toObject.decimals
                              )
                            )
                          )}
                        </p>
                        <span className="text-gray-500">
                          {" "}
                          {truncateString(toObject.symbol, 4)}
                        </span>
                      </td>
                      <td className="py-4 hidden md:table-cell">
                        <p className="font-bold inline">
                          {formatNumber(
                            Number(
                              parseFloat(
                                (toAmountFloat / fromAmountFloat).toFixed(4)
                              )
                            )
                          )}
                        </p>
                      </td>
                      <td className="py-4 hidden md:table-cell">
                        <p className="font-bold">
                          {truncateString(order.maker_id, 8)}{" "}
                        </p>
                      </td>
                      {showOrderStatus ? (
                        <td className="hidden md:table-cell">{order.status}</td>
                      ) : (
                        <></>
                      )}
                      <td className="py-4">
                        {multipleOrders ? (
                          <div className="flex justify-center">
                            {order.maker_id !== accountId &&
                            order.status === "Open" ? (
                              <Checkbox
                                onChange={() => handleCheck(order)}
                                className="group block size-6 rounded border-verto_border border-2 hover:border-3 hover:border-zinc-600 bg-verto_bg data-[checked]:bg-white"
                              >
                                {/* Checkmark icon */}
                                <svg
                                  className="stroke-black opacity-0 group-data-[checked]:opacity-100"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Checkbox>
                            ) : (
                              <></>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="rounded-md bg-gradient-to-r from-green-400 to-lime-300 w-[60px] hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            onClick={() => {
                              console.log(order);
                              showOrderDetails(order);
                            }}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                } else {
                  return <></>;
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
