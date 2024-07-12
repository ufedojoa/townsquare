import { Chain } from "viem";

export const ubitTestnet: Chain = {
  id: 44433,
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.ubitscan.io/"],
    },
  },
  nativeCurrency: {
    symbol: "tUSC",
    decimals: 18,
    name: "Test USC",
  },
  name: "[TESTNET] UBIT SMART CHAIN",
  blockExplorers: {
    default: {
      url: "https://testnet.ubitscan.io",
      name: "UBITSCAN",
    },
  },
};
export const ubit: Chain = {
  id: 90002,
  rpcUrls: {
    default: {
      http: ["https://rpc.ubitscan.io/"],
    },
  },
  nativeCurrency: {
    decimals: 18,
    name: "USC",
    symbol: "USC",
  },
  name: "Ubit SmartChain",
  blockExplorers: {
    default: {
      name: "UBit Scan",
      url: "https://ubitscan.io/",
      apiUrl: "https://ubitscan.io/api",
    },
  },
};
