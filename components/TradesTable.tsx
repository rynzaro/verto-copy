"use client";

import { VertoContract } from "@/lib/config/near";
import { defaultFilterValues, FilterValues, Order } from "@/lib/types/types";
import {
  convertIntToFloat,
  formatNumber,
  handleInput,
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

const sortOptions = ["price", "amountOffer", "amountFor"] as const;

export default function GetOrders({
  typeOfOrders,
  heading,
  showCompletedToggle,
  initialFilterValues,
}: {
  typeOfOrders: string;
  heading: string;
  showCompletedToggle: boolean;
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
  const [sort, setSort] = useState<{
    value: (typeof sortOptions)[number];
    order: "asc" | "desc";
  }>({
    value: "price",
    order: "asc",
  });
  const [filterValues, setFilterValues] = useState<FilterValues>({
    ...initialFilterValues,
  });

  function handleSort(orderBy: (typeof sortOptions)[number]) {
    setSort((prev) => {
      if (prev.value == orderBy) {
        return {
          value: prev.order == "desc" ? "price" : orderBy,
          order: prev.order == "desc" ? "asc" : "desc",
        };
      }
      return {
        value: orderBy,
        order: "asc",
      };
    });
  }

  const sortOrders = (orders: Order[]) => {
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
      } else if (sort.value === "price") {
        const a_ratio =
          parseFloat(a["to_amount"]) / parseFloat(a["from_amount"]);
        const b_ratio =
          parseFloat(b["to_amount"]) / parseFloat(b["from_amount"]);
        return sort.order === "asc" ? a_ratio - b_ratio : b_ratio - a_ratio;
      }
      const sortBy = sort.value === "amountOffer" ? "from_amount" : "to_amount";
      const a_decimals =
        sort.value === "amountOffer"
          ? tokenObjects[a.from_contract_id].decimals
          : tokenObjects[a.to_contract_id].decimals;
      const b_decimals =
        sort.value === "amountOffer"
          ? tokenObjects[b.from_contract_id].decimals
          : tokenObjects[b.to_contract_id].decimals;
      const a_float = parseFloat(convertIntToFloat(a[sortBy], a_decimals));
      const b_float = parseFloat(convertIntToFloat(b[sortBy], b_decimals));
      return sort.order === "asc" ? a_float - b_float : -(a_float - b_float);
    });
  };

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
      <div
        className={clsx("w-4/5 sm:w-full sm:px-4", {
          "max-w-2xl": typeOfOrders === "open",
          "max-w-4xl": typeOfOrders !== "open",
        })}
      >
        <div className="pt-4 flex">
          {/* <RefreshButton /> */}
          <FilterForm
            showCompletedToggle={showCompletedToggle}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            handleFilterOrders={filterOrders}
          />
        </div>

        <div>
          {succesful ? (
            <div
              className="flex items-center p-4 my-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800 fixed bottom-5 w-4/5"
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
          ) : (
            <></>
          )}

          {failed ? (
            <div
              className="flex items-center p-4 my-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800 fixed bottom-5 w-4/5"
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
          ) : (
            <></>
          )}
        </div>
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
                {typeOfOrders !== "open" ? (
                  <th className="px-3 py-4 hidden md:table-cell">Status</th>
                ) : (
                  <></>
                )}
                <th className="px-3 py-4">Action</th>
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
                      {typeOfOrders !== "open" ? (
                        <td className="hidden md:table-cell">{order.status}</td>
                      ) : (
                        <></>
                      )}
                      <td className="py-4">
                        <button
                          type="button"
                          className="rounded-md bg-gradient-to-r from-green-400 to-lime-300 w-[60px] hover:from-green-300 py-1 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                          onClick={() => {
                            showOrderDetails(order);
                          }}
                        >
                          Details
                        </button>
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
