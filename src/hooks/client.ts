import { useMemo } from "react";
import { TownsquareClient } from "../client";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { UBITSCAN_API_URL } from "@/config/constants";

export function useClient() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const account = useAccount();

  const client = useMemo(() => {
    if (!walletClient || !publicClient || !account.address) {
      return null;
    }
    return new TownsquareClient(UBITSCAN_API_URL, publicClient, walletClient, {
      address: account.address!,
      type: "json-rpc",
    });
  }, [account.address, publicClient, walletClient]);

  return client;
}
