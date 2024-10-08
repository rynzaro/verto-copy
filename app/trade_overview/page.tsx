"use client";

import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { Order, TokenMetadata } from "@/lib/types/types";
import { convertIntToFloat } from "@/lib/utils";
import { useState } from "react";

export default function Page() {
  const tokenObjects = useFetchTokenObjects();
  const [fromObject, setFromObject] = useState<TokenMetadata | null>(null);
  const [toObject, setToObject] = useState<TokenMetadata | null>(null);

  const order: Order = {
    id: "0",
    from_contract_id: "near",
    to_contract_id: "blekdragon.testnet",
    from_amount: "620000000000000000000000000",
    to_amount: "8000000000000000000000",
    status: "open",
    maker_id: "vertouser.near",
    taker_id: null,
  };

  function formatNumber(number: number) {
    // Convert number to a string
    let formattedNumber = number.toString();

    // Check if the number contains 'e' (scientific notation)
    if (formattedNumber.includes("e")) {
      formattedNumber = number.toFixed(20); // Convert to fixed-point notation with sufficient decimal places
    }
    // Remove trailing zeros and the decimal point if there are no decimals
    formattedNumber = formattedNumber
      .replace(/(\.\d*?[1-9])0+$/g, "$1")
      .replace(/\.0+$/, "");

    if (Number(formattedNumber) >= 1000) {
      formattedNumber = Number(formattedNumber).toLocaleString("en-US");
    }
    return formattedNumber;
  }
  if (!tokenObjects) {
    return;
  }

  return (
    <div className="flex justify-center">
      {tokenObjects["testnet"] && tokenObjects["near"] ? (
        <div className="w-[360px]">
          <div className="border border-gray-600 rounded-md divide-y divide-gray-600 w-full my-2">
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Trading Pair</div>
              <div>
                {tokenObjects[order.from_contract_id].symbol} -{" "}
                {tokenObjects[order.to_contract_id].symbol}
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Trade Type</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">
                Single Fill
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Order Status</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">
                {order.status.charAt(0).toUpperCase() +
                  order.status.substring(1)}
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">You send</div>
              <div>
                {formatNumber(
                  Number(
                    convertIntToFloat(
                      order.to_amount,
                      tokenObjects[order.to_contract_id].decimals,
                    ),
                  ),
                )}
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">You receive</div>
              <div>
                {formatNumber(
                  Number(
                    convertIntToFloat(
                      order.from_amount,
                      tokenObjects[order.from_contract_id].decimals,
                    ),
                  ),
                )}
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Price Per Token</div>
              <div>
                {formatNumber(
                  parseFloat(
                    convertIntToFloat(
                      order.from_amount,
                      tokenObjects[order.from_contract_id].decimals,
                    ),
                  ) /
                    parseFloat(
                      convertIntToFloat(
                        order.to_amount,
                        tokenObjects[order.to_contract_id].decimals,
                      ),
                    ),
                )}
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Order Creator</div>
              <div>{order.maker_id}</div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Fill Type</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">
                Single Fill
              </div>
            </div>
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Privacy Type</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">
                Public
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="flex-grow text-sm inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gradient-to-r px-3.5 py-2.5 font-semibold text-white shadow-sm border-2 border-green-300">
              Back
            </button>
            <button className="flex-grow text-sm inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gradient-to-r from-green-400 to-lime-300 px-3.5 py-2.5 font-semibold text-black shadow-sm">
              Fill Order
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
