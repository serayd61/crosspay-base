'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Wallet, QrCode, Send, Store, History, 
  Scan, Copy, Check, Loader2, ArrowRight,
  CreditCard, Shield, Zap, Users
} from 'lucide-react';
import { useFarcaster } from '@/providers/FarcasterProvider';
import toast from 'react-hot-toast';

// CrossPay Contract
const CROSSPAY_ADDRESS = '0x4d45baa1909b7f061b514ef50034c55d0b79b262';

type Tab = 'pay' | 'receive' | 'merchant' | 'history';

export default function Home() {
  const { isInFrame, user, connectedAddress } = useFarcaster();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransaction, isPending } = useSendTransaction();

  const [activeTab, setActiveTab] = useState<Tab>('pay');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const walletAddress = connectedAddress || address;

  const handleConnect = async () => {
    if (isInFrame) {
      // Use Farcaster wallet
      toast.success('Connected via Farcaster!');
    } else {
      // Use Coinbase Smart Wallet
      const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
      if (coinbaseConnector) {
        connect({ connector: coinbaseConnector });
      }
    }
  };

  const handlePay = async () => {
    if (!recipientAddress || !paymentAmount) {
      toast.error('Enter recipient and amount');
      return;
    }

    try {
      sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(paymentAmount),
      });
      toast.success('Payment sent!');
      setPaymentAmount('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Payment failed');
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
    if (!walletAddress || !paymentAmount) return '';
    return `ethereum:${walletAddress}@8453?value=${parseEther(paymentAmount || '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
            </div>

            {/* User Info / Connect */}
            {walletAddress ? (
              <div className="flex items-center gap-3">
                {isInFrame && user.pfpUrl && (
                  <img src={user.pfpUrl} alt="" className="w-8 h-8 rounded-full" />
                )}
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition"
              >
                <Wallet className="w-4 h-4" />
                Connect
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
                        className="px-3 py-1 rounded-lg bg-white/5 text-blue-300 text-sm hover:bg-white/10"
                      >
                        {amt} ETH
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={!walletAddress || isPending}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Payment
                    </>
                  )}
                </button>
              </div>
            )}

            {/* RECEIVE TAB */}
            {activeTab === 'receive' && (
              <div className="space-y-6 text-center">
                <div>
                  <label className="block text-sm text-blue-300 mb-2">Request Amount (ETH)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold text-center placeholder-blue-300/50 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {walletAddress && (
                  <div className="bg-white p-6 rounded-2xl inline-block">
                    <QRCodeSVG
                      value={generateQRData() || `ethereum:${walletAddress}`}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                )}

                <p className="text-blue-300 text-sm">
                  Scan this QR code to pay {paymentAmount || '0'} ETH
                </p>

                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy Address
                </button>
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
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold flex items-center justify-center gap-2">
                    Register as Merchant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <p className="text-center text-blue-300 py-8">
                  {walletAddress 
                    ? 'No transactions yet. Make your first payment!' 
                    : 'Connect wallet to view history'}
                </p>
              </div>
            )}
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
