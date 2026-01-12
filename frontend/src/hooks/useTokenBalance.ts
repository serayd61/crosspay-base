'use client';

import { useReadContract, useAccount } from 'wagmi';
import { ERC20_ABI } from '@/lib/contracts';
import { Address } from 'viem';

/**
 * Hook to get ERC-20 token balance
 */
export function useTokenBalance(tokenAddress: Address, chainId?: number) {
  const { address } = useAccount();

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: !!address,
    },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId,
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId,
  });

  return {
    balance: balance as bigint | undefined,
    decimals: decimals as number | undefined,
    symbol: symbol as string | undefined,
    isLoading,
    error,
    refetch,
  };
}
