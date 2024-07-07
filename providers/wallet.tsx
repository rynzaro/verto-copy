"use client";

import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { distinctUntilChanged, map } from "rxjs";
import "@near-wallet-selector/modal-ui/styles.css";
import { setupModal } from "@near-wallet-selector/modal-ui";
import {
  WalletSelector,
  setupWalletSelector,
} from "@near-wallet-selector/core";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { VertoContract, NetworkId } from "@/lib/config/near";
import { providers } from "near-api-js";
import { MethodParameters } from "@/lib/types/types";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

const THIRTY_TGAS = "30000000000000";
const NO_DEPOSIT = "0";

const AuthStatus = [
  "loading",
  "authenticated",
  "unauthenticated",
  "error",
] as const;

type AuthStatusType = (typeof AuthStatus)[number];

const NearWalletContext = createContext<{
  signIn: () => Promise<void | string>;
  signOut: () => void;
  viewMethod: ({
    contractId,
    method,
    args,
  }: {
    contractId: string;
    method: string;
    args?: Record<string, any>;
  }) => Promise<any>;
  callMethod: ({
    contractId,
    method,
    args,
    gas,
    deposit,
  }: {
    contractId: string;
    method: string;
    args: Record<string, any>;
    gas: string;
    deposit: string;
  }) => Promise<any>;
  callMethods: (walletParameters: MethodParameters[]) => Promise<any>;
  accountId: string | null;
  status: AuthStatusType;
  getTransactionResult: (transactionHash: string) => Promise<any>;
}>({
  viewMethod: async () => {},
  callMethod: async () => {},
  getTransactionResult: async () => {},
  callMethods: async () => {},
  status: "loading",
  accountId: null,
  signIn: async () => {},
  signOut: () => {},
});

const NearWalletProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatusType>("loading");
  const [walletSelector, setWalletSelector] = useState<WalletSelector | null>(
    null,
  );
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const meteorWallet = setupMeteorWallet({
    })

    const selector = setupWalletSelector({
      network: NetworkId,
      modules: [meteorWallet],
    }).then((selector) => {
      setWalletSelector(selector);
      setStatus(selector.isSignedIn() ? "authenticated" : "unauthenticated");
      selector.store.observable
        .pipe(
          map((state) => state.accounts),
          distinctUntilChanged(),
        )
        .subscribe((accounts) => {
          const signedAccount = accounts.find(
            (account) => account.active,
          )?.accountId;
          setAccountId(signedAccount || null);
          setStatus(signedAccount ? "authenticated" : "unauthenticated");
        });
    });
    // setupWalletSelector({
    //   network: NetworkId,
    //   modules: [setupMyNearWallet(), setupHereWallet()],
    // }).then((selector) => {
    //   setWalletSelector(selector);
    //   setStatus(selector.isSignedIn() ? "authenticated" : "unauthenticated");
    //   selector.store.observable
    //     .pipe(
    //       map((state) => state.accounts),
    //       distinctUntilChanged(),
    //     )
    //     .subscribe((accounts) => {
    //       const signedAccount = accounts.find(
    //         (account) => account.active,
    //       )?.accountId;
    //       setAccountId(signedAccount || null);
    //     });
    // });
  }, []);

  const signIn = async () => {
    if (!walletSelector) {
      return;
    }
    const modal = setupModal(walletSelector, {
      contractId: VertoContract,
    });
    modal.show();
  };

  const signOut = async () => {
    const selectedWallet = await walletSelector?.wallet();
    await selectedWallet?.signOut();
    setStatus("unauthenticated");
  };

  const viewMethod = async ({
    contractId,
    method,
    args = {},
  }: {
    contractId: string;
    method: string;
    args?: Record<string, any>;
  }) => {
    const url = `https://rpc.${NetworkId}.near.org`;
    const provider = new providers.JsonRpcProvider({ url });

    let res = await provider.query({
      request_type: "call_function",
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      finality: "optimistic",
    });

    //@ts-expect-error
    return JSON.parse(Buffer.from(res.result).toString());
  };

  const callMethod = async ({
    contractId,
    method,
    args = {},
    gas = THIRTY_TGAS,
    deposit = NO_DEPOSIT,
  }: {
    contractId: string;
    method: string;
    args: Record<string, any>;
    gas: string;
    deposit: string;
  }) => {
    if (!walletSelector) {
      return;
    }
    const selectedWallet = await walletSelector.wallet();
    const outcome = await selectedWallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });

    if (!outcome) {
      console.error("No outcome");
      return null;
    }
    return providers.getTransactionLastResult(outcome);
  };

  const callMethods = async (methodParameters: MethodParameters[]) => {
    if (!walletSelector) {
      return;
    }
    const selectedWallet = await walletSelector.wallet();

    const outcome = await selectedWallet.signAndSendTransactions({
      transactions: methodParameters.map((parameters) => ({
        receiverId: parameters.contractId,

        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: parameters.method,
              args: parameters.args,
              gas: parameters.gas,
              deposit: parameters.deposit,
            },
          },
        ],
      })),
    });

    if (!outcome) {
      console.error("No outcome");
      return null;
    }

    return outcome;
  };

  const getTransactionResult = async (transactionHash: string) => {
    if (!walletSelector) {
      return;
    }

    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const transaction = await provider.txStatus(transactionHash, "unnused");

    return providers.getTransactionLastResult(transaction);
  };

  return (
    <NearWalletContext.Provider
      value={{
        accountId,
        signIn,
        signOut,
        status,
        viewMethod,
        callMethod,
        callMethods,
        getTransactionResult,
      }}
    >
      {children}
    </NearWalletContext.Provider>
  );
};

export default NearWalletProvider;

export const useNearWallet = () => {
  return useContext(NearWalletContext);
};
