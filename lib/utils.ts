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