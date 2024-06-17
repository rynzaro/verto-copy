"use client"

import React, { useState, useEffect, useRef, Fragment, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from "clsx";
import { availableTokens } from "@/lib/availableTokens";

export default function TokenDropdown({
  selected, setSelected
}: { selected: typeof availableTokens[number], setSelected: Dispatch<SetStateAction<typeof availableTokens[number]>> }) {


  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative mt-2 text-zinc-400 bg-transparent">
            <ListboxButton className="relative w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left text-zinc-400 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.symbol}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>

            <Transition show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-zinc-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {availableTokens.map((token) => (
                  <ListboxOption
                    key={token.name}
                    className={({ focus }) =>
                      clsx(
                        focus ? 'bg-green-400 text-white' : '',
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
                        ) : null}
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

