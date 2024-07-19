import { http } from "wagmi";
import { localhost, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { LOCAL_DEV_MODE } from "./constants";
import { ubitTestnet } from "./chains";
// Your WalletConnect Cloud project ID
export const projectId = "5631779592a314149ef3eb3f0ded1275";

// Create a metadata object
const metadata = {
  name: "Townsquare",
  description: "",
  url: "https://trytownsquare.vercel.app", // origin must match your domain & subdomain
  icons: ["https://trytownsquare.vercel.app/icon.jpg"],
};

export const config = getDefaultConfig({
  appName: metadata.name,
  projectId,
  chains: [sepolia, ...(LOCAL_DEV_MODE ? [localhost] : [])],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
