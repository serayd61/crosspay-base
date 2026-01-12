'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

const SUPPORTED_CHAINS = [
  { id: base.id, name: 'Base', icon: '🔵' },
  { id: baseSepolia.id, name: 'Base Sepolia', icon: '🧪' },
  { id: mainnet.id, name: 'Ethereum', icon: '💎' },
];

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chainId) || SUPPORTED_CHAINS[0];

  const handleSwitch = (targetChainId: number) => {
    if (targetChainId === chainId) {
      setIsOpen(false);
      return;
    }

    switchChain({ chainId: targetChainId });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
      >
        <span>{currentChain.icon}</span>
        <span className="font-medium">{currentChain.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-20 bg-slate-800 rounded-xl border border-white/10 overflow-hidden min-w-[200px] shadow-xl">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleSwitch(chain.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition ${
                  chain.id === chainId ? 'bg-white/5' : ''
                }`}
              >
                <span className="text-xl">{chain.icon}</span>
                <span className="flex-1 text-white font-medium">{chain.name}</span>
                {chain.id === chainId && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
