"use client";

import NearWalletProvider, { useNearWallet } from "@/providers/wallet";
import { Fragment } from "react";
import { Disclosure, Menu, MenuItems, Transition } from "@headlessui/react";
// import PageNav from "@/components/PageNav";

import {
  Bars3Icon,
  BellIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

import HeroNav from "./HeroNav";
import PageNav from "@/components/PageNav";
import ProfileNav from "./ProfileNav";

const navigation = [
  { name: "Trade", href: "/", current: false },
  { name: "Explore", href: "/browser", current: true },
  { name: "Dashboard", href: "/dashboard", current: false },
];

export default function NavBar() {
  const { accountId, signIn, signOut, status } = useNearWallet();
  return (
    <NearWalletProvider>
      <div className="flex bg-zinc-800 bg-opacity-70 justify-between w-3/4 items-center py-2 px-4 rounded-2xl z-50">
        <HeroNav />
        <PageNav />
      </div>
    </NearWalletProvider>
  );
}
