"use client";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

var navigation = [
  // { name: "Trade", href: "/", current: false },
  { name: "Explore", href: "/explore", current: false },
  { name: "Dashboard", href: "/dashboard", current: false },
];

export default function PageNav() {
  const [currentLink, setCurrentLink] = useState(
    navigation.find((item) => item.current)?.name || "",
  );

  return (
    <nav
      // className="ml-10 flex justify-around lg:flex lg:space-x-8 lg:py-2"
      className="ml-10 flex justify-around space-x-8 py-2"
      aria-label="Global"
    >
      <Link
        key={"Trade"}
        href={"/"}
        className="text-bold text-lg hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 w-full rounded-xl  bg-gradient-to-r from-vblue to-lime-400 px-3 py-3 font-semibold text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {" "}
        Create Trade{" "}
      </Link>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={clsx(
            currentLink === item.name
              ? "bg-zinc-900 text-white"
              : "text-zinc-300 hover:bg-zinc-700 hover:text-white",
            "inline-flex items-center rounded-xl py-2 px-3 text-l font-bold",
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
