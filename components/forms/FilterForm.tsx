"use client";

import { FilterValues, Order, TokenMetadata } from "@/lib/types/types";
import { convertIntToFloat, handleNumericInput } from "@/lib/utils";
import { Field, Label, MenuButton, Switch } from "@headlessui/react";
import { Dispatch, useEffect, useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ArrowsUpDownIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
} from "@heroicons/react/20/solid";

export default function FilterForm({
  // showCompletedToggle,
  filterValues,
  setFilterValues,
  handleFilterOrders,
}: {
  // showCompletedToggle: boolean;
  filterValues: FilterValues;
  setFilterValues: Dispatch<React.SetStateAction<FilterValues>>;
  handleFilterOrders: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [ref]);

  function clearFilter() {
    setFilterValues((prev) => ({
      ...prev,
      minFromAmount: "",
      maxFromAmount: "",
      minToAmount: "",
      maxToAmount: "",
      minPrice: "",
      maxPrice: "",
    }));
  }

  function toggleVisible() {
    setVisible((prev) => !prev);
  }

  const [fromMept, setFromMept] = useState(false);

  function handleMept() {
    setFromMept((prev) => !prev);
  }

  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      buyMept: fromMept ? true : false,
    }));
  }, [fromMept]);

  // function toggleShowCompleted() {
  //   setFilterValues((prev) => ({
  //     ...prev,
  //     showCompleted: !prev.showCompleted,
  //   }));
  // }

  const filterMenu = (
    <div className="relative flex gap-x-2 gap-y-4 justify-between z-0">
      <button
        className=" flex items-center px-3.5 py-2 font-semibold h-full rounded-md text-mg focus:outline-none bg-zinc-800 hover:bg-zinc-600"
        onClick={toggleVisible}
      >
        <FunnelIcon className="h-4 w-4" />
        <span className="hidden sm:inline sm:pl-2">Filter</span>
      </button>
      {/* <span className="absolute -inset-1.5" /> */}
      {/* <span className="sr-only">Open user menu</span> */}
      {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5 my-1 mx-0.5 hidden:size-6 sm:pr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg> */}

      <div className="relative flex">
        <button
          type="button"
          className={`flex items-center text-mg px-3.5 py-2 mr-2 h-full bg-zinc-800 shadow-sm rounded-md font-semibold text-white focus:outline-none hover:bg-zinc-600 `}
          onClick={() => {
            handleMept();
          }}
        >
          {!fromMept ? (
            <ArrowRightIcon className="h-6 w-6 pr-2" />
          ) : (
            <ArrowLeftIcon className="h-6 w-6 pr-2" />
          )}
          MEPT
        </button>
      </div>
      {/* {showCompletedToggle ? (
        <Field className="flex items-center relative text-white mx-4">
          <Switch
            checked={filterValues.showCompleted}
            onChange={toggleShowCompleted}
            className="group relative inline-flex items-center h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-verto_border bg-verto_bg transition-colors duration-200 ease-in-out  data-[checked]:bg-lime-300"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-verto_bg shadow ring-0 transition duration-200  ease-in-out ${filterValues.showCompleted ? "translate-x-9" : "translate-x-1"}`}
            />
          </Switch>
          <Label as="span" className="ml-3 text-sm ">
            <span className="font-medium text-white">
              Show Completed Orders
            </span>{" "}
          </Label>
        </Field>
      ) : (
        <></>
      )} */}
    </div>
  );

  if (!visible) {
    return filterMenu;
  }

  return (
    <div className="relative">
      {filterMenu}
      <div
        className="w-[320px] sm:w-[480px] bg-verto_bg left-0 ring-2 ring-verto_border rounded-xl px-3 absolute py-4 mt-0"
        ref={ref}
      >
        <div className="uppercase mb-1">From Amount</div>
        <div className="flex justify-center items-center gap-2">
          <div className="flex flex-col py-2 px-2 rounded-lg mb-2 ring-1 ring-verto_border">
            <div className="flex">
              <input
                type="text"
                name="minFromAmount"
                id="minFromAmount"
                value={filterValues.minFromAmount}
                onChange={(e) => handleNumericInput(e, setFilterValues, 20)}
                autoComplete="off"
                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                placeholder="MIN"
              />
            </div>
          </div>
          <div className="flex flex-col py-2 px-2 rounded-lg mb-2 ring-1 ring-verto_border">
            <div className="flex">
              <input
                type="text"
                name="maxFromAmount"
                id="maxFromAmount"
                value={filterValues.maxFromAmount}
                onChange={(e) => handleNumericInput(e, setFilterValues, 20)}
                autoComplete="off"
                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                placeholder="MAX"
              />
            </div>
          </div>
        </div>

        <div className="uppercase mb-1">To Amount</div>
        <div className="flex justify-center items-center gap-2">
          <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
            <div className="flex">
              <input
                type="text"
                name="minToAmount"
                id="minToAmount"
                value={filterValues.minToAmount}
                onChange={(e) => handleNumericInput(e, setFilterValues, 20)}
                autoComplete="off"
                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                placeholder="MIN"
              />
            </div>
          </div>
          <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
            <div className="flex">
              <input
                type="text"
                name="maxToAmount"
                id="maxToAmount"
                value={filterValues.maxToAmount}
                onChange={(e) => handleNumericInput(e, setFilterValues, 20)}
                autoComplete="off"
                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                placeholder="MAX"
              />
            </div>
          </div>
        </div>

        <div className="uppercase mb-1">Price</div>
        <div className="flex justify-center items-center gap-2">
          <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
            <div className="flex">
              <input
                type="text"
                name="minPrice"
                id="minPrice"
                value={filterValues.minPrice}
                onChange={(e) => handleNumericInput(e, setFilterValues, 20)}
                autoComplete="off"
                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                placeholder="MIN"
              />
            </div>
          </div>
          <div className="flex flex-col py-2 px-2 w-full rounded-lg mb-2 justify-between ring-1 ring-verto_border">
            <div className="flex">
              <input
                type="text"
                name="maxPrice"
                id="maxPrice"
                value={filterValues.maxPrice}
                onChange={(e) => handleNumericInput(e, setFilterValues, 20)}
                autoComplete="off"
                className="p-0 bg-transparent outline-none border-0 focus:outline-none w-full min-w-0"
                placeholder="MAX"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mt-2">
          <button
            className="rounded-md w-full py-2 px-2 bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300  text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={handleFilterOrders}
          >
            Filter
          </button>
          <button
            className="rounded-md w-full py-2 px-2 bg-gradient-to-r from-green-400 to-lime-300 hover:from-green-300 text-sm font-semibold text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={clearFilter}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
