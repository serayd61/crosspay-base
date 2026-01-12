'use client';

import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckCircle2, Loader2, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransactionStatusProps {
  hash: `0x${string}`;
  chainId?: number;
  onSuccess?: (receipt: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

type Status = 'pending' | 'success' | 'error' | 'confirming';

export function TransactionStatus({
  hash,
  chainId = 8453, // Base Mainnet
  onSuccess,
  onError,
  showToast = true,
}: TransactionStatusProps) {
  const [status, setStatus] = useState<Status>('pending');
  const [error, setError] = useState<Error | null>(null);

  const { data: receipt, isLoading, isSuccess, isError, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  });

  useEffect(() => {
    if (isLoading) {
      setStatus('confirming');
    } else if (isSuccess && receipt) {
      setStatus('success');
      if (showToast) {
        toast.success('Transaction confirmed!');
      }
      onSuccess?.(receipt);
    } else if (isError || txError) {
      setStatus('error');
      const err = txError as Error || new Error('Transaction failed');
      setError(err);
      if (showToast) {
        toast.error(`Transaction failed: ${err.message}`);
      }
      onError?.(err);
    }
  }, [isLoading, isSuccess, isError, receipt, txError, onSuccess, onError, showToast]);

  const getExplorerUrl = () => {
    const baseUrl = chainId === 8453 
      ? 'https://basescan.org/tx/'
      : chainId === 84532
      ? 'https://sepolia.basescan.org/tx/'
      : `https://etherscan.io/tx/`;
    return `${baseUrl}${hash}`;
  };

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-blue-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Transaction pending...</span>
      </div>
    );
  }

  if (status === 'confirming') {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Confirming transaction...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm">Transaction confirmed!</span>
        <a
          href={getExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-cyan-400 hover:underline flex items-center gap-1"
        >
          View on Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <XCircle className="w-4 h-4" />
        <span className="text-sm">Transaction failed</span>
        {error && (
          <span className="text-xs text-red-300 ml-2">({error.message})</span>
        )}
      </div>
    );
  }

  return null;
}

interface TransactionButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TransactionButton({
  onClick,
  disabled = false,
  isLoading = false,
  children,
  className = '',
}: TransactionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
