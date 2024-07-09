"use client";

import useFetchTokenObjects from "@/hook/FetchTokenObjects";
import { Order, TokenMetadata } from "@/lib/types/types";
import Image from "next/image";
import { convertIntToFloat, formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function OrderPopup({
  order,
  close,
  tokenObjects,
  orderActionButton,
}: {
  order: Order | null;
  close: () => void;
  tokenObjects: { [key: string]: TokenMetadata };
  orderActionButton: JSX.Element | undefined;
}) {
  if (!order) {
    return null;
  }

  const fromObject = tokenObjects[order.from_contract_id];
  const toObject = tokenObjects[order.to_contract_id];

  return (
    <div className="flex justify-center">
      <div className="w-[360px]">
        <div className="border border-gray-600 rounded-md divide-y divide-gray-600 w-full my-2">
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">Trading Pair</div>
            <div>
              <span className="flex items-center justify-center">
                <Image
                  src={fromObject.icon}
                  alt={fromObject.name}
                  height={20}
                  width={20}
                  className="mr-1 rounded-full object-cover border-2 border-black"
                  aria-hidden="true"
                />
                {fromObject.symbol} -
                <Image
                  src={toObject.icon}
                  alt={toObject.name}
                  height={20}
                  width={20}
                  className="mr-1 rounded-full object-cover border-2 border-black"
                  aria-hidden="true"
                />
                {toObject.symbol}
              </span>
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
              {order.status.charAt(0).toUpperCase() + order.status.substring(1)}
            </div>
          </div>
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">You send</div>
            <div>
              {formatNumber(
                Number(convertIntToFloat(order.to_amount, toObject.decimals))
              )}{" "}
              {toObject.symbol}
            </div>
          </div>
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">You receive</div>
            <div>
              {formatNumber(
                Number(
                  convertIntToFloat(order.from_amount, fromObject.decimals)
                )
              )}{" "}
              {fromObject.symbol}
            </div>
          </div>
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">Price Per Token</div>
            <div>
              {formatNumber(
                parseFloat(
                  convertIntToFloat(order.from_amount, fromObject.decimals)
                ) /
                  parseFloat(
                    convertIntToFloat(order.to_amount, toObject.decimals)
                  )
              )}
            </div>
          </div>
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">Order Creator</div>
            <div>{order.maker_id}</div>
          </div>
          {order.taker_id !== null && order.status === "Completed" ? (
            <div className="flex justify-between px-4 py-3 font-bold text-sm">
              <div className="text-gray-400">Order Taker</div>
              <div>{order.taker_id}</div>
            </div>
          ) : (
            <></>
          )}
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">Order Creator</div>
            <div>{order.maker_id}</div>
          </div>
          <div className="flex justify-between px-4 py-3 font-bold text-sm">
            <div className="text-gray-400">Privacy Type</div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">
              Public
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="text-sm inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gradient-to-r px-3.5 py-2.5 font-semibold text-white shadow-sm border-2 border-green-300"
            type="button"
            onClick={close}
          >
            Back
          </button>
          {orderActionButton}
        </div>
      </div>
    </div>
  );
}
