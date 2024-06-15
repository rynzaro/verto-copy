import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface TokenDropdownProps {
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onSelect: (selectedOption: { label: string; value: string }) => void;
}

const TokenDropdown: React.FC<TokenDropdownProps> = ({
  label,
  options,
  placeholder = "Select Token",
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [hasClickedOnce, setHasClickedOnce] = useState(false); // Track whether dropdown has been clicked

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!hasClickedOnce) {
      setHasClickedOnce(true);
    }
  };

  const handleOptionClick = (option: { label: string; value: string }) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const buttonWidth = buttonRef.current?.offsetWidth;
    if (isOpen && buttonWidth) {
      dropdownRef.current?.style.setProperty("width", `${buttonWidth}px`);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-1/3">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        // className="inline-flex justify-center w-1/2 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        className="w-full rounded-lg bg-verto_bg border-2 border-verto_borders font-bold p-4 placeholder:text-verto_wt text-xl focus:outline-none hover-inset-border2 overflow-hidden"
      >
        {/* <span className="truncate">
          {selectedOption
            ? selectedOption.label
            : hasClickedOnce
              ? placeholder
              : label}
        </span> */}
        {selectedOption
          ? selectedOption.label
          : hasClickedOnce
            ? placeholder
            : label}
        {/* <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.894.553l3 6a1 1 0 01-.447 1.341l-6 3a1 1 0 01-1.342-.447l-3-6a1 1 0 01.447-1.342l6-3A1 1 0 0110 3zm0 2.236L6.236 8.5l3.264 6.528L13.5 9.764 10 5.236z"
            clipRule="evenodd"
          />
        </svg> */}
      </button>

      {isOpen && (
        <div className="w-full z-50 origin-top-left absolute left-0 mt-2 rounded-lg text-center border-verto_borders shadow-lg  bg-verto_bg ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div
            ref={dropdownRef}
            className="py-1 border-verto_borders border-2 rounded-lg"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="dropdownButton"
          >
            {options.map((option, index) => (
              <a
                key={index}
                className={`block px-4 py-2 text-sm${
                  selectedOption === option
                    ? "text-black bg-zinc-900"
                    : "text-gray-700 hover:bg-zinc-500 hover:rounded-lg"
                }`}
                role="menuitem"
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;
