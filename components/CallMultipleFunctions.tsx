"use client";

import { VertoContract } from "@/lib/config/near";
import { Order } from "@/lib/types/types";
import { handleInput } from "@/lib/utils";
import { useNearWallet } from "@/providers/wallet";
import { FormEvent, Key, useEffect, useState } from "react";
import { MethodParameters } from "@/lib/types/types";

const MAX_GAS = "300000000000000";
const NO_DEPOSIT = "0";

export default function CallMultipleFunctionsButton() {
  const CONTRACT = VertoContract;
  const { accountId, callMethods, viewMethod } = useNearWallet();
  const REGISTER = "ncat.testnet";
  const TRANSACTION = "ndog.testnet";

  const handleClick = () => {
    let transactions: MethodParameters[] = [];

    viewMethod({
      contractId: REGISTER,
      method: "storage_balance_of",
      args: {
        account_id: accountId,
      },
    }).then((balance) => {
      if (balance === null) {
        transactions.push({
          contractId: REGISTER,
          method: "storage_deposit",
          args: {
            account_id: accountId,
            registration_only: true,
          },
          gas: MAX_GAS,
          deposit: "1000000000000000000000000",
        });
      } else
        transactions.push({
          contractId: TRANSACTION,
          method: "ft_transfer",
          args: {
            receiver_id: "verto.testnet",
            amount: "100",
          },
          gas: MAX_GAS,
          deposit: "1",
        });
      callMethods(transactions).catch((error) => console.log(error));
    });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      Call Functions
    </button>
  );
}
