import { useNearWallet } from "@/providers/wallet";

export const availableTokens = [
    { name: "near", symbol: "NEAR", contractId: "near", icon: ''},
    { name: "usdc", symbol: "USDC", contractId: "usdc.fakes.testnet", icon: ''},
    { name: "aurora", symbol: "AURORA", contractId: "aurora.fakes.testnet", icon: ''},
    { name: "eth", symbol: "ETH", contractId: "eth.fakes.testnet", icon: ''}
]