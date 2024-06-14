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
