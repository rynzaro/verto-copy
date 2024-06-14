"use client";

// import React from "react";
import { handleInput } from "@/lib/utils";
import { VertoContract } from "@/lib/config/near";
import { useNearWallet } from "@/providers/wallet";
import React, { FormEvent, useEffect, useState } from "react";
import GetMakeOrdersForm from "@/components/forms/GetMakeOrdersForm";
import GetOrderForm from "@/components/forms/GetOrderForm";
import OrderTable from "@/components/OrderTable";
import OrderOverview from "@/components/OrderOverview";
import { Order } from "@/lib/types/types";

export default function Explorer() {
  const { accountId, signIn, signOut, status } = useNearWallet();

  return (
    <>
      {status === "authenticated" ? (
        <div className="flex w-full items-center justify-center opacity-75">
          <div className="pt-48">
            <OrderTable typeOfOrders="open" heading="" />
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-center opacity-75">
          <div className="pt-48">PLEASE LOGIN</div>
        </div>
      )}
    </>
  );
}
