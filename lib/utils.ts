import { Dispatch, SetStateAction } from "react";

export const handleInput = (
  event: any,
  setValues: Dispatch<SetStateAction<any>>
) => {
  const { name, value } = event.target;

  setValues((prevFormData: any) => ({
    ...prevFormData,
    [name]: value,
  }));
};

export const handleNumericInput = (
  event: any,
  setValues: Dispatch<SetStateAction<any>>,
  decimals: number
) => {
  const { name, value } = event.target;

  /// we only allow:
  /// - one leading zero ^(0|[1-9]\\d*)
  /// - decimals amount of digits after the comma
  /// - one comma or point
  /// - an empty string
  const regex = new RegExp(`^(0|[1-9]\\d*)([.,]\\d{0,${decimals}})?$|^$`);
  if (regex.test(value)) {
    setValues((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  }
};

export function convertIntToFloat(amount: string, decimals: number): string {
  const digitsAmount = amount.length;
  let result: string;
  if (digitsAmount <= decimals) {
    const additionalZeros = "0".repeat(decimals - digitsAmount);
    result = `0.${additionalZeros}${amount}`;
  } else {
    const index = digitsAmount - decimals;
    result = `${amount.slice(0, index)}.${amount.slice(index)}`;
  }
  // Remove trailing zeros after comma and remove the comma if it's the last character
  if (result.includes(".")) {
    result = result.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  return result;
}

export function convertIntToFloat_(amount: string, decimals: number): string {
  const number = parseInt(amount);
  return (number * Math.pow(10, -decimals)).toString();
}

export function convertFloatToInt(input: string, decimals: number): string {
  // Replace a comma with a dot to standardize the separator
  input = input.replace(",", ".");

  if (input.includes(".")) {
    // Split the number into integer and fractional parts
    let [integerPart, fractionalPart] = input.split(".");

    // Calculate the number of zeros to add
    let zerosToAdd = decimals - fractionalPart.length;

    // If there are more digits than decimals, truncate the fractional part
    if (zerosToAdd < 0) {
      fractionalPart = fractionalPart.slice(0, decimals);
      zerosToAdd = 0;
    }

    // Remove the dot and add the zeros
    return integerPart + fractionalPart + "0".repeat(zerosToAdd);
  } else {
    // No separator present, just add `decimals` number of zeros
    return input + "0".repeat(decimals);
  }
}

export function truncateString(str: string, length: number) {
  if (str.length > length) {
    return str.substring(0, length) + "...";
  }
  return str;
}

export function formatNumber(number: number) {
  if (number > -1 && number < 1) {
    number = +number.toFixed(3);
  } else if (number > -10 && number < 10) {
    number = +number.toFixed(2);
  } else if (number > -100 && number < 100) {
    number = +number.toFixed(1);
  } else {
    number = +number.toFixed();
  }
  return number.toLocaleString("en-US", { maximumFractionDigits: 12 });
}

export function formatNumberPrecisely(number: number) {
  return number.toLocaleString("en-US", { maximumFractionDigits: 12 });
}

export function formatNumberShort(number: number) {
  const numStr = number.toFixed();
  const digits = numStr.charAt(0) === "-" ? numStr.length - 1 : numStr.length;
  const commaPosition = digits % 3;

  if (number < 100) {
    return roundToSignificantDigits(number, 3).toString();
  } else if (number >= 1000000000000000) {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    });
  } else {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: commaPosition === 0 ? 0 : 3 - commaPosition,
      notation: "compact",
      compactDisplay: "short",
    });
  }
}

function roundToSignificantDigits(number: number, digits: number) {
  if (number === 0) {
    return 0;
  }

  const d = Math.ceil(Math.log10(Math.abs(number)));
  const power = digits - d;

  const magnitude = Math.pow(10, power);
  const shifted = Math.round(number * magnitude);
  return shifted / magnitude;
}

/*
function formatNumberShort(number) {
  const numStr = number.toFixed();
  const digits = numStr.charAt(0) === "-" ? numStr.length - 1 : numStr.length;
  const commaPosition = digits % 3;
  number = roundToSignificantDigits(number, 3);
  let threeDigits = "";
  if (number < 100) {
    return number.toString();
  }

  const threeLetters = threeDigits.toString();
  console.log(threeLetters);
  let postfix = "";
  if (digits > 3) {
    postfix = " K";
  } else if (digits > 6) {
    postfix = " M";
  } else if (digits > 9) {
    postfix = " B";
  } else if (digits > 12) {
    postfix = " T";
  }

  if (number < 0.01) {
    return number.toString();
  }
  if (commaPosition === 0) {
    return threeDigits;
  }
  return `${threeLetters.slice(0, commaPosition)}.${threeLetters.slice(commaPosition)}`;
}
  */
