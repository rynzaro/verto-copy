"use client";

import { useNearWallet } from "@/providers/wallet";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const navigation = [
  { name: "Create Order", href: "/" },
  { name: "Market", href: "/market" },
  { name: "Orders Created", href: "/orders-created" },
  { name: "Orders Filled", href: "/orders-filled" },
];

export default function Navigation() {
  const { accountId, signIn, signOut, status } = useNearWallet();
  const pathName = usePathname();

  return (
    <Disclosure
      as="nav"
      className="bg-verto_bg border-b-2 border-b-verto_border py-2 font-bold text-white"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 bg-verto_bg">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                {/* <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    alt="Your Company"
                  />
                </div> */}
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => {
                      if (
                        status === "unauthenticated" &&
                        (item.name === "Created Orders" ||
                          item.name === "My Orders")
                      ) {
                        return <></>;
                      }
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            item.name === "Create Order"
                              ? "bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 hover:to-indigo-400  text-black hover:text-black"
                              : "",
                            pathName.endsWith(item.href) &&
                              item.name !== "Create Order"
                              ? "bg-zinc-800 text-white"
                              : "hover:bg-zinc-700",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={
                            pathName.endsWith(item.href) ? "page" : undefined
                          }
                        >
                          {item.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* User area */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Unauthenticated */}
                {status === "unauthenticated" ? (
                  <button
                    type="button"
                    onClick={signIn}
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-gradient-to-r button-gradient px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <WalletIcon
                      className="-ml-0.5 h-5 w-5"
                      aria-hidden="true"
                    />
                    Connect wallet
                  </button>
                ) : (
                  <></>
                )}

                {status === "authenticated" ? (
                  <>
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <MenuButton className="relative flex rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <span className="inline-flex items-center gap-x-1.5 rounded-md  px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                            <WalletIcon
                              className="-ml-0.5 h-5 w-5"
                              aria-hidden="true"
                            />
                            {accountId}
                          </span>
                        </MenuButton>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                type="button"
                                onClick={signOut}
                                className={clsx(
                                  focus ? "bg-zinc-100" : "",
                                  "block px-4 py-2 text-sm text-black w-full"
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <></>
                )}
                {/* Profile dropdown */}
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={clsx(
                    pathName.endsWith(item.href)
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-300 hover:bg-zinc-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={
                    pathName.endsWith(item.href) ? "page" : undefined
                  }
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
