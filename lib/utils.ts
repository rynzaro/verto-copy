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
    result = result.replace(/\.?y+$/, '');

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
