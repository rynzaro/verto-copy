"use client"

import React, { useState, useEffect, useRef, Fragment, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { useNearWallet } from "@/providers/wallet";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from "clsx";
import { availableTokens } from "@/lib/availableTokens";
import useGetTokenObjects from "@/hook/FetchTokenObjects";
import { TokenMetadata } from "@/lib/types/types";

export default function TokenDropdown({
  selected, setSelected
}: { selected: TokenMetadata, setSelected: Dispatch<SetStateAction<TokenMetadata>> }) {
  const tokenObjects = useGetTokenObjects();
  if (!tokenObjects) {
    return;
  }

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative mt-2 text-zinc-400 bg-transparent">
            <ListboxButton className="relative w-full min-w-[100px] cursor-default rounded-md py-1.5 pl-3 pr-10 text-left text-zinc-400 shadow-sm ring-inset ring-verto_border ring-1 focus:outline-none sm:text-sm sm:leading-6 hover:ring-2">

              <div className="flex">
                {selected.icon !== "loading" ?
                  <span className='inset-y-0 left-0 flex items-center pl-0'>
                    <Image src={selected.icon} alt={selected.name} height={20} width={20} className="h-5 w-5 rounded-full object-cover" aria-hidden="true" />
                  </span>
                  :
                  <></>
                }
                <span className="font-normal truncate ml-2">
                  {selected.symbol}
                </span>
              </div>


              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>

            <Transition show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-verto_bg py-1 text-base shadow-lg ring-1 ring-verto_border sm:text-sm">
                {Object.values(tokenObjects).map((token) => (
                  <ListboxOption
                    key={token.name}
                    className={({ focus }) =>
                      clsx(
                        focus ? 'bg-zinc-700 text-white cursor-pointer' : '',
                        !focus ? 'text-zinc-400' : '',
                        'relative cursor-default select-none py-2 pl-8 pr-4'
                      )
                    }
                    value={token}
                  >
                    {({ selected, focus }) => (
                      <>
                        <span className={clsx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {token.symbol}
                        </span>

                        {selected ? (
                          <span
                            className={clsx(
                              focus ? 'text-white' : 'text-green-400',
                              'absolute inset-y-0 left-0 flex items-center pl-1.5'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) :
                          <span className='absolute inset-y-0 left-0 flex items-center pl-1.5'>
                            <Image src={token.icon} alt={token.name} height={20} width={20} className="h-5 w-5 rounded-full object-cover" aria-hidden="true" />
                          </span>
                        }
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

