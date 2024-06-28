import { availableTokens } from "@/lib/availableTokens";
import { TokenMetadata } from "@/lib/types/types";
import { useNearWallet } from "@/providers/wallet";
import { useEffect, useState } from "react";

export default function useFetchTokenObjects() {
    const { viewMethod } = useNearWallet();
    const [tokenObjects, setTokenObjects] = useState<{ [key: string]: TokenMetadata}>({});

    async function getMetadata(contractId: string) {
        if (contractId === 'near') {
            return {
                contractId: "near",
                symbol: "NEAR",
                name: "near",
                icon: "/near-icon-rev.svg",
                decimals: 24,
            }
        }
        const ft_metadata = await viewMethod({
            contractId: contractId,
            method: 'ft_metadata',
        })
        return {
            contractId: contractId,
            symbol: ft_metadata.symbol,
            name: contractId.split(".")[0],
            icon: ft_metadata.icon,
            decimals: ft_metadata.decimals,
        }
    }

    useEffect(() => {
        const tempTokenObjects: { [key: string]: TokenMetadata} = {}
        const tokenPromises = availableTokens.map(async (token) => {
            const tokenInfo = await getMetadata(token);
            tempTokenObjects[token] = tokenInfo;
        })

        Promise.all(tokenPromises).then(() => {
            setTokenObjects(tempTokenObjects)
        })


    }, [])

    return tokenObjects;
}