'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

const queryClient = new QueryClient();

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id';

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    // Coinbase Wallet (includes Base Wallet)
    coinbaseWallet({
      appName: 'CrossPay',
      appLogoUrl: 'https://crosspay-base.vercel.app/icon.png',
    }),
    // Injected wallets (MetaMask, Rabby, etc.)
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect (mobile wallets)
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'CrossPay',
        description: 'Instant crypto payments on Base',
        url: 'https://crosspay-base.vercel.app',
        icons: ['https://crosspay-base.vercel.app/icon.png'],
      },
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
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
