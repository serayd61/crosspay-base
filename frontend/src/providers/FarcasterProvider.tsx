'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';

type FrameContextType = Awaited<typeof sdk.context>;

interface FarcasterContextType {
  context: FrameContextType | null;
  isSDKLoaded: boolean;
  isInFrame: boolean;
  connectedAddress: string | null;
  user: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
  };
}

const FarcasterContext = createContext<FarcasterContextType>({
  context: null,
  isSDKLoaded: false,
  isInFrame: false,
  connectedAddress: null,
  user: { fid: null, username: null, displayName: null, pfpUrl: null },
});

export const useFarcaster = () => useContext(FarcasterContext);

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FrameContextType | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const ctx = await sdk.context;
        if (ctx) {
          setContext(ctx);
          setIsInFrame(true);
          sdk.actions.ready();

          // Get wallet address
          try {
            const accounts = await sdk.wallet.ethProvider?.request({ 
              method: 'eth_requestAccounts' 
            }) as string[];
            if (accounts?.[0]) setConnectedAddress(accounts[0]);
          } catch {}
        }
      } catch {} finally {
        setIsSDKLoaded(true);
      }
    };
    init();
  }, []);

  const user = {
    fid: context?.user?.fid ?? null,
    username: context?.user?.username ?? null,
    displayName: context?.user?.displayName ?? null,
    pfpUrl: context?.user?.pfpUrl ?? null,
  };

  return (
    <FarcasterContext.Provider value={{ context, isSDKLoaded, isInFrame, connectedAddress, user }}>
      {children}
    </FarcasterContext.Provider>
  );
}

