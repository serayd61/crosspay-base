'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { 
  coinbaseWallet, 
  injected, 
  walletConnect,
} from 'wagmi/connectors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id';

// Get RPC URLs from environment or use defaults
const getRpcUrl = (chainId: number) => {
  switch (chainId) {
    case base.id:
      return process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
    case baseSepolia.id:
      return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
    case mainnet.id:
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com';
    default:
      return 'https://mainnet.base.org';
  }
};

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, mainnet],
  connectors: [
    // Coinbase Wallet (includes Base Wallet)
    coinbaseWallet({
      appName: 'CrossPay',
      appLogoUrl: 'https://crosspay-base.vercel.app/icon.png',
      preference: 'all', // Support both smart wallet and EOA
    }),
    // Injected wallets (MetaMask, Rabby, Trust Wallet, etc.)
    injected({
      shimDisconnect: true,
      target: 'metaMaskSDK', // Prioritize MetaMask SDK if available
    }),
    // Additional injected connector for other wallets
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect (mobile wallets)
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'CrossPay',
        description: 'Instant crypto payments on Base blockchain',
        url: 'https://crosspay-base.vercel.app',
        icons: ['https://crosspay-base.vercel.app/icon.png'],
      },
    }),
  ],
  transports: {
    [base.id]: http(getRpcUrl(base.id)),
    [baseSepolia.id]: http(getRpcUrl(baseSepolia.id)),
    [mainnet.id]: http(getRpcUrl(mainnet.id)),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
