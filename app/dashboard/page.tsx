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

export default function ProfileDashboard() {
  const { accountId, signIn, signOut, status } = useNearWallet();
  const [selectedOption, setSelectedOption] = useState("Open");

  const renderContent = () => {
    switch (selectedOption) {
      case "Claimable":
        return <OrderTable typeOfOrders="claimable" heading="" />;
      case "Open":
        return <OrderTable typeOfOrders="make" heading="" />;
      case "Cancelled":
        return <OrderTable typeOfOrders="cancelled" heading="" />;
    }
  };
  return (
    <>
      {status === "authenticated" ? (
        <div className="flex flex-col w-full items-center justify-center opacity-75">
          <div className="pt-48 w-1/2 flex justify-between">
            <button
              className={`block bg-verto_bg py-2 px-4 text-left rounded mb-2 ${selectedOption === "Open" ? "bg-gradient-to-r from-green-400 to-lime-300 text-black" : "hover:bg-slate-600"}`}
              onClick={() => setSelectedOption("Open")}
            >
              Open Orders
            </button>
            <button
              className={`block bg-verto_bg py-2 px-4 text-left rounded mb-2 ${selectedOption === "Completed" ? "bg-gradient-to-r from-green-400 to-lime-300 text-black" : "hover:bg-slate-600"}`}
              onClick={() => setSelectedOption("Completed")}
            >
              Completed Orders
            </button>
            <button
              className={`block bg-verto_bg py-2 px-4 text-left rounded mb-2 ${selectedOption === "Claimable" ? "bg-gradient-to-r from-green-400 to-lime-300 text-black" : "hover:bg-slate-600"}`}
              onClick={() => setSelectedOption("Claimable")}
            >
              Claimable Orders
            </button>

            <button
              className={`block bg-verto_bg py-2 px-4 text-left rounded mb-2 ${selectedOption === "Cancelled" ? "bg-gradient-to-r from-green-400 to-lime-300 text-black" : "hover:bg-slate-600"}`}
              onClick={() => setSelectedOption("Cancelled")}
            >
              Cancelled Orders
            </button>
          </div>
          <div className="pt-12">{renderContent()}</div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-center opacity-75">
          <div className="pt-48">PLEASE LOGIN</div>
        </div>
      )}
    </>
  );
}
