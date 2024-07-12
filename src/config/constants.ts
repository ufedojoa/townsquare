import { Address } from "viem";

export const LOCAL_DEV_MODE =
  process.env.NEXT_PUBLIC_LOCAL_DEV_MODE === "true" ||
  process.env.NODE_ENV === "development";

export const MAIN_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS as Address;

export const UBITSCAN_API_URL = process.env.NEXT_PUBLIC_UBITSCAN_API_URL ?? "https://testnet.ubitscan.io/api";
