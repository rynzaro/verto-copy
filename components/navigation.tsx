"use client";

import { useNearWallet } from "@/providers/wallet";
import { Fragment } from "react";
import { Disclosure, Menu, MenuItems, Transition } from "@headlessui/react";
import PageNav from "@/components/PageNav";

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

const navigation = [
  { name: "Trade", href: "/", current: false },
  { name: "Explore", href: "/browser", current: true },
  { name: "Dashboard", href: "/dashboard", current: false },
];

export default function Navigation() {
  const { accountId, signIn, signOut, status } = useNearWallet();
  return (
    <Disclosure as="header" className="bg-zinc-800 px-10 mx-5 mt-5 rounded-xl">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:divide-y lg:divide-zinc-700 lg:px-8">
            <div className=" flex h-16 justify-around">
              <div className="relative z-10 flex px-2 lg:px-0 w-1/2">
                <div className="flex flex-shrink-0 items-center justify-between w-full">
                  <div className="font-bold text-3xl">VERTO</div>
                  <PageNav />
                  <div className="relative z-10 flex items-center lg:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
                {status === "unauthenticated" ? (
                  <button
                    type="button"
                    onClick={signIn}
                    className="text-black font-bold inline-flex items-center gap-x-1.5 rounded-md bg-gradient-to-r from-green-400 to-lime-300 px-3 py-2 text-sm shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <WalletIcon
                      className="-ml-0.5 h-5 w-5"
                      aria-hidden="true"
                    />
                    CONNECT
                  </button>
                ) : (
                  <></>
                )}

                {/* Profile dropdown */}
                {status === "authenticated" ? (
                  <>
                    {" "}
                    <button
                      type="button"
                      className="relative flex-shrink-0 rounded-full bg-zinc-800 p-1 text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">View Alerts</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <Menu as="div" className="relative ml-4 flex-shrink-0">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-zinc-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open Overview</span>
                          {/* <img
                            className="h-8 w-8 rounded-full"
                            src={user.imageUrl}
                            alt=""
                          /> */}
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
                        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-zinc-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            <button
                              type="button"
                              onClick={signOut}
                              className={
                                "block px-4 py-2 text-sm text-zinc-700"
                              }
                            >
                              Sign Out
                            </button>
                          </Menu.Item>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel as="nav" className="lg:hidden" aria-label="Global">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={clsx(
                    item.current
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-300 hover:bg-zinc-700 hover:text-white",
                    "block rounded-md py-2 px-3 text-base font-medium",
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {status === "unauthenticated" ? (
              <div className="w-full p-4">
                <button
                  type="button"
                  onClick={signIn}
                  className="block w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  CONNECT
                </button>
              </div>
            ) : (
              <></>
            )}

            {status === "authenticated" ? (
              <div className="border-t border-zinc-700 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.imageUrl}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-zinc-400">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="relative ml-auto flex-shrink-0 rounded-full bg-zinc-800 p-1 text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Disclosure.Button
                    as="button"
                    type="button"
                    onClick={signOut}
                    className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  >
                    Sign Out
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
