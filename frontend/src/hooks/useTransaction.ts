'use client';

import { useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, Address } from 'viem';
import toast from 'react-hot-toast';

interface UseTransactionOptions {
  onSuccess?: (hash: `0x${string}`) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Enhanced transaction hook with better error handling and status tracking
 */
export function useTransaction(options: UseTransactionOptions = {}) {
  const { onSuccess, onError, showToast = true } = options;
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const {
    sendTransaction,
    isPending: isSending,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isFailed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  const sendTx = async (params: {
    to: Address;
    value?: string; // ETH amount as string
    data?: `0x${string}`;
    gas?: bigint;
  }) => {
    try {
      resetSend();
      setTxHash(null);

      const hash = await new Promise<`0x${string}`>((resolve, reject) => {
        sendTransaction(
          {
            to: params.to,
            value: params.value ? parseEther(params.value) : undefined,
            data: params.data,
            gas: params.gas,
          },
          {
            onSuccess: (hash) => {
              setTxHash(hash);
              resolve(hash);
              if (showToast) {
                toast.success('Transaction sent! Waiting for confirmation...');
              }
              onSuccess?.(hash);
            },
            onError: (error) => {
              reject(error);
              if (showToast) {
                toast.error(`Transaction failed: ${error.message}`);
              }
              onError?.(error);
            },
          }
        );
      });

      return hash;
    } catch (error) {
      const err = error as Error;
      if (showToast) {
        toast.error(`Transaction failed: ${err.message}`);
      }
      onError?.(err);
      throw error;
    }
  };

  return {
    sendTransaction: sendTx,
    hash: txHash,
    receipt,
    isSending,
    isConfirming,
    isConfirmed,
    isFailed,
    isLoading: isSending || isConfirming,
    error: sendError || confirmError,
    reset: () => {
      resetSend();
      setTxHash(null);
    },
  };
}
