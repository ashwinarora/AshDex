import { http, createConfig } from "wagmi";
import { mainnet, optimism, base } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const phantomWalletConnector = injected({
  target: "phantom",
});

const trustWalletConnector = injected({
  target: "trustWallet",
});
console.log(
  "process.env.NEXT_PUBLIC_WALLET_CONNECT_ID",
  process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
);
export const config = createConfig({
  chains: [mainnet, optimism, base],
  connectors: [
    phantomWalletConnector,
    trustWalletConnector,
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? "",
    }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});
