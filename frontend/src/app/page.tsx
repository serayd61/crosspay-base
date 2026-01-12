'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSendTransaction, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Wallet, QrCode, Send, Store, History, 
  Scan, Copy, Check, Loader2, ArrowRight,
  CreditCard, Shield, Zap, Users, X, ChevronRight
} from 'lucide-react';
import { useFarcaster } from '@/providers/FarcasterProvider';
import sdk from '@farcaster/frame-sdk';
import toast from 'react-hot-toast';
import { TransactionStatus, TransactionButton } from '@/components/TransactionStatus';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { useTransaction } from '@/hooks/useTransaction';
import { getErrorMessage, parseWeb3Error } from '@/lib/errors';
import { validateAddress } from '@/lib/contracts';

// CrossPay Contract
const CROSSPAY_ADDRESS = '0x4d45baa1909b7f061b514ef50034c55d0b79b262';

type Tab = 'pay' | 'receive' | 'merchant' | 'history';

// Wallet Icons
const WalletIcons: Record<string, string> = {
  'Farcaster': '🟣',
  'Base Wallet': '🔵',
  'Coinbase Wallet': '🔷',
  'MetaMask': '🦊',
  'WalletConnect': '🔗',
  'Injected': '💉',
};

export default function Home() {
  const { isInFrame, user, connectedAddress } = useFarcaster();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransaction, isPending } = useSendTransaction();
  const {
    sendTransaction: sendTx,
    hash: txHash,
    isLoading: isTxLoading,
    isConfirmed,
    error: txError,
  } = useTransaction({
    onSuccess: (hash) => {
      toast.success('Transaction sent!');
      setPaymentAmount('');
      setRecipientAddress('');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const [activeTab, setActiveTab] = useState<Tab>('pay');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const walletAddress = connectedAddress || address;

  // Get balance
  const { data: balanceData } = useBalance({
    address: walletAddress as `0x${string}`,
  });

  // Handle Farcaster wallet connection
  const handleFarcasterConnect = async () => {
    try {
      const ethProvider = sdk.wallet.ethProvider;
      if (ethProvider) {
        const accounts = await ethProvider.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts?.[0]) {
          toast.success('Connected via Farcaster!');
          setShowWalletModal(false);
        }
      }
    } catch (error) {
      console.error('Farcaster wallet error:', error);
      toast.error('Failed to connect Farcaster wallet');
    }
  };

  // Handle regular wallet connection
  const handleConnect = async (connectorId: string) => {
    const selectedConnector = connectors.find(c => c.id === connectorId || c.name === connectorId);
    if (selectedConnector) {
      try {
        connect({ connector: selectedConnector });
        setShowWalletModal(false);
      } catch (error) {
        toast.error('Connection failed');
      }
    }
  };

  const handlePay = async () => {
    if (!recipientAddress || !paymentAmount) {
      toast.error('Enter recipient and amount');
      return;
    }

    // Validate address
    if (!validateAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    // Validate amount
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      // Check if in Farcaster and use their provider
      if (isInFrame && connectedAddress) {
        const ethProvider = sdk.wallet.ethProvider;
        if (ethProvider) {
          const txHash = await ethProvider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: connectedAddress,
              to: recipientAddress,
              value: `0x${parseEther(paymentAmount).toString(16)}`,
            }],
          });
          toast.success('Payment sent!');
          setPaymentAmount('');
          setRecipientAddress('');
          return;
        }
      }

      // Use enhanced transaction hook
      await sendTx({
        to: recipientAddress as `0x${string}`,
        value: paymentAmount,
      });
    } catch (error) {
      const parsedError = parseWeb3Error(error);
      toast.error(getErrorMessage(parsedError));
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQRData = () => {
    if (!walletAddress) return '';
    if (paymentAmount) {
      return `ethereum:${walletAddress}@8453?value=${parseEther(paymentAmount)}`;
    }
    return `ethereum:${walletAddress}@8453`;
  };

  // Available wallets for connection
  const availableWallets = [
    ...(isInFrame ? [{ id: 'farcaster', name: 'Farcaster Wallet', icon: '🟣', description: 'Use your Warpcast wallet' }] : []),
    { id: 'coinbaseWalletSDK', name: 'Coinbase Wallet', icon: '🔷', description: 'Includes Base Wallet' },
    { id: 'injected', name: 'Browser Wallet', icon: '🦊', description: 'MetaMask, Rabby, etc.' },
    { id: 'walletConnect', name: 'WalletConnect', icon: '🔗', description: 'Mobile wallets' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl max-w-md w-full border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => wallet.id === 'farcaster' ? handleFarcasterConnect() : handleConnect(wallet.id)}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition group"
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">{wallet.name}</p>
                    <p className="text-sm text-blue-300">{wallet.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-300 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
            <div className="p-4 bg-white/5 text-center">
              <p className="text-sm text-blue-300">
                New to crypto? <a href="https://www.coinbase.com/wallet" target="_blank" className="text-cyan-400 hover:underline">Get Coinbase Wallet</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CrossPay</h1>
                <p className="text-xs text-blue-300">Base Network</p>
              </div>
              {isInFrame && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  Farcaster
                </span>
              )}
            </div>

            {/* User Info / Connect */}
            {walletAddress ? (
              <div className="flex items-center gap-3">
                <NetworkSwitcher />
                {isInFrame && user.pfpUrl && (
                  <img src={user.pfpUrl} alt="" className="w-8 h-8 rounded-full border-2 border-purple-400" />
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white font-medium">
                    {balanceData ? `${parseFloat(formatEther(balanceData.value)).toFixed(4)} ETH` : '...'}
                  </p>
                  <p className="text-xs text-blue-300">Base Network</p>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span className="font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </button>
                <button
                  onClick={() => disconnect()}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition animate-pulse"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Instant Crypto Payments
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Send and receive payments on Base with QR codes. Only 1% fee.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Zap, label: 'Instant', value: '< 2 sec' },
            { icon: Shield, label: 'Fee', value: '1%' },
            { icon: Users, label: 'Merchants', value: '100+' },
            { icon: CreditCard, label: 'Volume', value: '$50K+' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
              <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-blue-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main App */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'pay', icon: Send, label: 'Pay' },
              { id: 'receive', icon: QrCode, label: 'Receive' },
              { id: 'merchant', icon: Store, label: 'Merchant' },
              { id: 'history', icon: History, label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 transition ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border-b-2 border-cyan-400'
                    : 'text-blue-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* PAY TAB */}
            {activeTab === 'pay' && (
              <div className="space-y-6">
                {!walletAddress && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <p className="text-yellow-300">Connect your wallet to make payments</p>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="mt-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-blue-300 mb-2">Recipient Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x... or name.base.eth"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-300/50 focus:border-cyan-400 focus:outline-none"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg">
                      <Scan className="w-5 h-5 text-blue-300" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-blue-300 mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold placeholder-blue-300/50 focus:border-cyan-400 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {['0.001', '0.01', '0.1'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setPaymentAmount(amt)}
                        className="px-3 py-1 rounded-lg bg-white/5 text-blue-300 text-sm hover:bg-white/10 hover:text-white transition"
                      >
                        {amt} ETH
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <TransactionButton
                    onClick={handlePay}
                    disabled={!walletAddress || isTxLoading || !recipientAddress || !paymentAmount}
                    isLoading={isTxLoading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    Send Payment
                  </TransactionButton>
                  {txHash && (
                    <TransactionStatus
                      hash={txHash}
                      onSuccess={() => {
                        setPaymentAmount('');
                        setRecipientAddress('');
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* RECEIVE TAB */}
            {activeTab === 'receive' && (
              <div className="space-y-6 text-center">
                {!walletAddress ? (
                  <div className="py-8">
                    <p className="text-blue-300 mb-4">Connect wallet to receive payments</p>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-blue-300 mb-2">Request Amount (ETH) - Optional</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.001"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold text-center placeholder-blue-300/50 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="bg-white p-6 rounded-2xl inline-block shadow-xl">
                      <QRCodeSVG
                        value={generateQRData()}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>

                    <p className="text-blue-300 text-sm">
                      {paymentAmount ? `Scan to pay ${paymentAmount} ETH` : 'Scan to pay any amount'}
                    </p>

                    <button
                      onClick={copyAddress}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      Copy Address
                    </button>
                  </>
                )}
              </div>
            )}

            {/* MERCHANT TAB */}
            {activeTab === 'merchant' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl p-6 border border-cyan-400/30">
                  <Store className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Become a Merchant</h3>
                  <p className="text-blue-200 mb-4">
                    Accept crypto payments with QR codes. Only 1% platform fee.
                  </p>
                  <ul className="space-y-2 text-sm text-blue-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400" /> Instant settlements
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400" /> QR code generation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400" /> Real-time dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400" /> Multi-wallet support
                    </li>
                  </ul>
                  <button 
                    onClick={() => walletAddress ? toast.success('Merchant registration coming soon!') : setShowWalletModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90"
                  >
                    {walletAddress ? 'Register as Merchant' : 'Connect Wallet First'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {!walletAddress ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-blue-300/50 mx-auto mb-4" />
                    <p className="text-blue-300 mb-4">Connect wallet to view history</p>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-blue-300/50 mx-auto mb-4" />
                    <p className="text-blue-300">No transactions yet</p>
                    <p className="text-sm text-blue-400 mt-2">Make your first payment to see it here!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Supported Wallets */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-300 mb-3">Supported Wallets</p>
          <div className="flex justify-center gap-4 text-2xl">
            <span title="Farcaster">🟣</span>
            <span title="Base Wallet">🔵</span>
            <span title="Coinbase Wallet">🔷</span>
            <span title="MetaMask">🦊</span>
            <span title="WalletConnect">🔗</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-300 text-sm">
          <p>Built on Base • Contract: <a href={`https://basescan.org/address/${CROSSPAY_ADDRESS}`} target="_blank" className="text-cyan-400 hover:underline">{CROSSPAY_ADDRESS.slice(0,10)}...</a></p>
        </div>
      </section>
    </div>
  );
}
