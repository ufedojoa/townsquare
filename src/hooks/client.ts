import { useMemo } from "react";
import { TownsquareClient } from "../client";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export function useClient() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const account = useAccount();

  const client = useMemo(() => {
    if (!walletClient || !publicClient || !account.address) {
      return null;
    }
    return new TownsquareClient(publicClient, walletClient, {
      address: account.address!,
      type: "json-rpc",
    });
  }, [account.address, publicClient, walletClient]);

  return client;
}
