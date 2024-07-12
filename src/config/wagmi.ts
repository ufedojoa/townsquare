import { http } from "wagmi";
import { localhost } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { LOCAL_DEV_MODE } from "./constants";
import { ubit, ubitTestnet } from "./chains";
// Your WalletConnect Cloud project ID
export const projectId = "5631779592a314149ef3eb3f0ded1275";

// Create a metadata object
const metadata = {
  name: "Townsquare",
  description: "",
  url: "https://townsquare.vercel.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = getDefaultConfig({
  appName: metadata.name,
  projectId,
  chains: [ubitTestnet, ubit, ...(LOCAL_DEV_MODE ? [localhost] : [])],
  ssr: true,
  transports: {
    [ubitTestnet.id]: http(),
    [ubit.id]: http(),
    [localhost.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
