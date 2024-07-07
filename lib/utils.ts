import { Dispatch, SetStateAction } from "react";

export const handleInput = (
    event: any,
    setValues: Dispatch<SetStateAction<any>>,
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
    decimals: number,
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
    };
}


export function convertIntToFloat(amount: string, decimals: number): string {
    const digitsAmount = amount.length;
    let result: string;
    if (digitsAmount <= decimals) {
        const additionalZeros = '0'.repeat(decimals - digitsAmount);
        result = `0.${additionalZeros}${amount}`;
    } else {
        const index = digitsAmount - decimals;
        result = `${amount.slice(0, index)}.${amount.slice(index)}`;
    }
    // Remove trailing zeros after comma and remove the comma if it's the last character
    if (result.includes('.')) {
        result = result.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); 
    }
    return result
}

export function convertFloatToInt(input: string, decimals: number): string {
    // Replace a comma with a dot to standardize the separator
    input = input.replace(',', '.');

    if (input.includes('.')) {
        // Split the number into integer and fractional parts
        let [integerPart, fractionalPart] = input.split('.');

        // Calculate the number of zeros to add
        let zerosToAdd = decimals - fractionalPart.length;

        // If there are more digits than decimals, truncate the fractional part
        if (zerosToAdd < 0) {
            fractionalPart = fractionalPart.slice(0, decimals);
            zerosToAdd = 0;
        }

        // Remove the dot and add the zeros
        return integerPart + fractionalPart + '0'.repeat(zerosToAdd);
    } else {
        // No separator present, just add `decimals` number of zeros
        return input + '0'.repeat(decimals);
    }
}

export function truncateString(str: string, length: number) {
    if (str.length > length) {
        return str.substring(0, length) + '...';
    }
    return str;
}


export function formatNumber(number: number) {
    // Convert number to a string
    let formattedNumber = number.toString();

    // Check if the number contains 'e' (scientific notation)
    if (formattedNumber.includes('e')) {
        formattedNumber = number.toFixed(20); // Convert to fixed-point notation with sufficient decimal places
    }
    // Remove trailing zeros and the decimal point if there are no decimals
    formattedNumber = formattedNumber.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/, '');

    if (Number(formattedNumber) >= 1000) {
        formattedNumber = Number(formattedNumber).toLocaleString('en-US');
    }
    return formattedNumber;
}