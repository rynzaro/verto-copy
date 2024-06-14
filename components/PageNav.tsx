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
    <nav className="ml-10 lg:flex lg:space-x-8 lg:py-2" aria-label="Global">
      <Link
        key={"Trade"}
        href={"/"}
        className="text-bold text-lg transition-bg hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200 w-full rounded-xl  bg-gradient-to-r from-green-400 to-lime-300 px-3 py-3 font-semibold text-zinc-900 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {" "}
        Create Trade{" "}
      </Link>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={clsx(
            // item.current
            currentLink === item.name
              ? "bg-zinc-900 text-white"
              : "text-zinc-300 hover:bg-zinc-700 hover:text-white",
            "inline-flex items-center rounded-md py-2 px-3 text-l font-bold",
          )}
          //   aria-current={item.current ? "page" : undefined}
          // >
          //   {item.name}
          // aria-current={currentLink === item.name ? "page" : undefined}
          // onClick={() => handleLinkClick()}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
