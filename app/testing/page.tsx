"use client";

import { useNearWallet } from "@/providers/wallet";
import React, { useEffect, useState } from "react";

const CONTRACT = "usdc.testnet";

export default function Testing() {
  const { viewMethod } = useNearWallet();
  const [DECIMALS, setDecimals] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const meta = await viewMethod({
        contractId: CONTRACT,
        method: "ft_metadata",
      });
      setDecimals(meta.decimals);
    };
    fetchData();
  });

  return (
    <>
      <div className="flex w-full min-h-max text-6xl justify-center pt-36">
        Decimals for <b>{CONTRACT}</b>: {DECIMALS}
      </div>
    </>
  );
}
