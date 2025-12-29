import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { FarcasterProvider } from '@/providers/FarcasterProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CrossPay - Instant Crypto Payments on Base',
  description: 'Accept and send crypto payments instantly with QR codes. Built on Base blockchain with only 1% fees.',
  openGraph: {
    title: 'CrossPay - Instant Crypto Payments',
    description: 'QR code payments on Base blockchain',
    images: ['https://crosspay-base.vercel.app/og-image.png'],
  },
  other: {
    'fc:frame': JSON.stringify({
      version: '1',
      imageUrl: 'https://crosspay-base.vercel.app/preview.png',
      button: {
        title: '💳 Open CrossPay',
        action: {
          type: 'launch_frame',
          url: 'https://crosspay-base.vercel.app',
          name: 'CrossPay',
          splashImageUrl: 'https://crosspay-base.vercel.app/splash.png',
          splashBackgroundColor: '#3B82F6'
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <FarcasterProvider>
            {children}
            <Toaster position="top-center" />
          </FarcasterProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
