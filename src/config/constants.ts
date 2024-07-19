import { Address } from "viem";
import { ubitTestnet } from "./chains";
import { localhost, sepolia } from "viem/chains";

export const LOCAL_DEV_MODE =
  process.env.NEXT_PUBLIC_LOCAL_DEV_MODE === "true" ||
  process.env.NODE_ENV === "development";

export const MAIN_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS as Address;
export const UBIT_TESTNET_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_UBIT_TESTNET_CONTRACT_ADDRESS as Address;
export const LOCALHOST_CONTRACT_ADDRESS = process.env
.NEXT_PUBLIC_LOCALHOST_CONTRACT_ADDRESS as Address;

export const contractAddresses = {
  [ubitTestnet.id]: UBIT_TESTNET_CONTRACT_ADDRESS,
  [sepolia.id]: MAIN_CONTRACT_ADDRESS,
  [localhost.id]: LOCALHOST_CONTRACT_ADDRESS,
};
