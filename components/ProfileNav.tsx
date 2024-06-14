"use client";

import { useNearWallet } from "@/providers/wallet";
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
  name: "Ilya Polosukhin",
  email: "ilya.polosukhin@example.com",
  imageUrl:
    "https://cryptofest.co.za/wp-content/uploads/2020/10/Illia-360x360.jpg",
};

export default function ProfileNav() {
  const { accountId, signIn, signOut, status } = useNearWallet();
  return (
    <div className=" lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
      {status === "unauthenticated" ? (
        <button
          type="button"
          onClick={signIn}
          className="text-black rounded-xl font-bold inline-flex items-center bg-gradient-to-r from-green-400 to-lime-300 p-4 text-xl hover:bg-gradient-to-r hover:from-green-300 hover:to-lime-200"
        >
          {/* <WalletIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" /> */}
          CONNECT
        </button>
      ) : (
        <></>
      )}

      {/* Profile dropdown */}
      {status === "authenticated" ? (
        <div className="flex justify-between items-center ml-4 py-3 px-4 z-50">
          {" "}
          {/* <button
            type="button"
            className="relative flex-shrink-0  p-1 text-zinc-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">View Alerts</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button> */}
          <Menu
            as="div"
            className="relative ml-4  border-2 border-transparent flex-shrink-0 "
          >
            <div>
              <Menu.Button className="py-2.5 px-4 relative flex items-center text-white focus:border-verto_wt hover:border-verto_borders">
                <div className="relative py-2.5 px-4 flex items-center border-2 border-transparent hover:rounded-lg hover:border-zinc-700 focus:border-white">
                  <img
                    className="h-14 w-14 rounded-full"
                    src={user.imageUrl}
                    alt=""
                  />
                  <div className="text-sm text-zinc-300 font-bold pl-4 uppercase">
                    {accountId}
                  </div>
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 left-0 z-10 mt-4 origin-top-right rounded-md bg-zinc-800 hover:bg-zinc-500 text-white py-2 px-4 shadow-lg ring-1 ring-black ring-opacity-5">
                <Menu.Item>
                  <button
                    type="button"
                    onClick={signOut}
                    className={
                      "block px-4 py-2 font-semibold text-sm text-white w-full "
                    }
                  >
                    SIGN OUT
                  </button>
                </Menu.Item>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
