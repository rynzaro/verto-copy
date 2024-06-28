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

export const handleNumericInput =(
    event: any,
    setValues: Dispatch<SetStateAction<any>>,
    decimals: number,
) => {
    const { name, value } = event.target;

    /// we only allow:
    /// - one leading zero
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


export function convertIntToFloat(amount: string, decimals: number) {
    const digitsAmount = amount.length;
    let result: string;
    if (digitsAmount <= decimals) {
        const additionalZeros = '0'.repeat(decimals - digitsAmount);
        result =  `0.${additionalZeros}${amount}`;
    } else {
        const index = digitsAmount - decimals;
        result =  `${amount.slice(0, index)}.${amount.slice(index)}`;
    }
    result = result.replace(/\.?0+$/, '');

    return result
}