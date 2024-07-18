export type Order = {
  id: string;
  from_contract_id: string;
  to_contract_id: string;
  from_amount: string;
  to_amount: string;
  status: string;
  maker_id: string;
  taker_id: string | null;
};

export type MethodParameters = {
  contractId: string;
  method: string;
  args: Record<string, any>;
  gas: string;
  deposit: string;
};

export type TokenMetadata = {
  contractId: string;
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
};

export const defaultTokenMetadata: TokenMetadata = {
  contractId: "loading",
  symbol: "LOADING",
  name: "loading",
  icon: "loading",
  decimals: 0,
};

export type FilterValues = {
  minFromAmount: string;
  maxFromAmount: string;
  minToAmount: string;
  maxToAmount: string;
  minPrice: string;
  maxPrice: string;
  fromAccountId: boolean;
  toAccountId: boolean;
  buyMept: boolean;
};

export const defaultFilterValues: FilterValues = {
  minFromAmount: "",
  maxFromAmount: "",
  minToAmount: "",
  maxToAmount: "",
  minPrice: "",
  maxPrice: "",
  fromAccountId: false,
  toAccountId: false,
  buyMept: true,
};

export type Sort = {
  value: string;
  order: "asc" | "desc";
};

export const defaultSort: Sort = {
  value: "price",
  order: "asc",
};
