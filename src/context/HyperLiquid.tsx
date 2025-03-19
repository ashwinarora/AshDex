"use client"
import React, { createContext, useState, ReactNode, useEffect, useMemo, useContext } from 'react';
import { useAccount } from 'wagmi';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { Hex, PrivateKeyAccount } from 'viem';
import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { IClearingHouseState, MetaData, WsUserFills } from '@/utils/hyperLiquidTypes';
import { AGENT_PRIVATE_KEY } from '@/utils/constants';
import { mainnetAxios, testnetAxios } from '@/config/axios';

interface HyperLiquidContextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any;
  isSdkConnected: boolean;
  allMids: PriceMap;
  agentWallet: PrivateKeyAccount | undefined;
  hyperliquidAxios: AxiosInstance;
  universe: MetaData[] | undefined;
  clearingHouseState: IClearingHouseState | undefined;
}

const initialValue = {
  sdk: null,
  isSdkConnected: false,
  allMids: {},
  agentWallet: undefined,
  hyperliquidAxios: mainnetAxios,
  universe: undefined,
  clearingHouseState: undefined
}

const HyperLiquidContext = createContext<HyperLiquidContextProps>(initialValue);

export interface PriceMap {
  [key: string]: number;
}

export const HyperLiquidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected, chain } = useAccount();
  const [agentWallet, setAgentWallet] = useState<PrivateKeyAccount>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sdk, setSdk] = useState<any>();
  const [isSdkScriptLoaded, setIsSdkScriptLoaded] = useState(false);
  const [isSdkConnected, setIsSdkConnected] = useState(false);
  const [privateKey, setPrivateKey] = useState<string>();
  const [allMids, setAllMids] = useState<PriceMap>({});
  const { data: clearingHouseState, refetch: refetchClearingHouseState} = useQuery({
    queryKey: ['clearingHouseState', address, chain?.id],
    queryFn: async () => {
      const res = await sdk.info.perpetuals.getClearinghouseState(address);
      return res as IClearingHouseState;
    },
    enabled: !!sdk || !!isSdkConnected
  })
  
  const { data: universe } = useQuery({
    queryKey: ['universe', chain?.id],
    queryFn: async () => {
      const res = await sdk.info.perpetuals.getMeta();
      return res.universe as MetaData[];
    },
    enabled: !!sdk || !!isSdkConnected
  })

  const hyperliquidAxios = useMemo(() => {
    if (chain?.testnet) {
      return testnetAxios
    }
    return mainnetAxios
  }, [chain])


  // effect to load the Hyperliquid SDK
  useEffect(() => {
    const script = document.createElement("script");
    // script.src = "https://unpkg.com/hyperliquid/dist/browser.global.js";
    script.src = "/lib/hyperliquidSdk.js";
    script.async = true;

    script.onload = async () => {
      setIsSdkScriptLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      setIsSdkScriptLoaded(false);
    };
  }, []);

  // effect to generate or load the agent wallet
  useEffect(() => {
    if (!address) return;
    const storageKey = AGENT_PRIVATE_KEY + "_" + address;
    const storedPrivateKey = localStorage.getItem(storageKey);
    if (storedPrivateKey) {
      const wallet = privateKeyToAccount(storedPrivateKey as Hex);
      setAgentWallet(wallet);
      setPrivateKey(storedPrivateKey);
    } else {
      const newPrivateKey = generatePrivateKey();
      localStorage.setItem(storageKey, newPrivateKey);
      const wallet = privateKeyToAccount(newPrivateKey);
      setAgentWallet(wallet);
      setPrivateKey(newPrivateKey);
    }
  }, [address]);

  useEffect(() => {
    const initSdk = async () => {
      if (!isSdkScriptLoaded) return;
      if (!isConnected) return;
      if (!privateKey) return;
      if (!chain) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).HyperliquidSDK) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sdkInstance = new (window as any).HyperliquidSDK.Hyperliquid({
        testnet: chain?.testnet,
        enableWs: true,
        privateKey: privateKey,
        walletAddress: address,
      });
      await sdkInstance.connect();
      setSdk(sdkInstance);
      setIsSdkConnected(true);
      console.log("Hyperliquid SDK initialized:", sdkInstance);
    }
    initSdk();
  }, [isConnected, isSdkScriptLoaded, privateKey, chain, address]);

  useEffect(() => {
    if (!sdk) return;
    sdk.subscriptions.subscribeToAllMids((data: PriceMap) => {
      setAllMids(data);
    });
    return () => {
      sdk.subscriptions.unsubscribeFromAllMids();
    };
  }, [sdk]);

  useEffect(() => {
    if (!sdk) return;
    console.log("Subscribing to fills");
    sdk.subscriptions.subscribeToUserFills(address, (data: WsUserFills) => {
      console.log("User Fills Update",data)
      refetchClearingHouseState();
    });
    return () => {
      sdk.subscriptions.unsubscribeFromUserFills();
    };
  }, [sdk, address, refetchClearingHouseState]);

  return (
    <HyperLiquidContext.Provider value={{ sdk, isSdkConnected, allMids, agentWallet, hyperliquidAxios, universe, clearingHouseState }}>
      {children}
    </HyperLiquidContext.Provider>
  );
};


export const useHyperLiquid = (): HyperLiquidContextProps => {
  const context = useContext(HyperLiquidContext);
  if (!context) {
    throw new Error('useHyperLiquid must be used within a HyperLiquidProvider');
  }
  return context;
};
