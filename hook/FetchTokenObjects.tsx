import { availableTokens } from "@/lib/availableTokens";
import { useNearWallet } from "@/providers/wallet";
import { useEffect, useState } from "react";

export default function useFetchTokenObjects() {
    const { viewMethod } = useNearWallet();
    const [tokenObjects, setTokenObjects] = useState<(typeof availableTokens[number] & { icon: string })[]>([]);

    async function getIcon(contractId: string) {
        if (contractId === 'near') {
            return "/near-icon-rev.svg"
        }
        const ft_metadata = await viewMethod({
            contractId: contractId,
            method: 'ft_metadata',
        })
        return ft_metadata.icon
    }

    useEffect(() => {
        const tokenPromises = availableTokens.map(async (token) => ({
            ...token,
            icon: await getIcon(token.contractId)
        }))
        const results = Promise.all(tokenPromises)
            .then((result) => setTokenObjects(result))
            .catch((e) => console.log(e))
    }, [])

    return tokenObjects;
}