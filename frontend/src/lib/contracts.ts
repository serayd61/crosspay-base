/**
 * Smart Contract Utilities
 * ERC-20, ERC-721, ERC-1155 interaction helpers
 */

import { Address, parseUnits, formatUnits, isAddress } from 'viem';
import { readContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '@/providers/Web3Provider';

const config = wagmiConfig;

// ERC-20 Standard ABI
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

// ERC-721 Standard ABI
export const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

// ERC-1155 Standard ABI
export const ERC1155_ABI = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_id', type: 'uint256' },
      { name: '_value', type: 'uint256' },
      { name: '_data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    type: 'function',
  },
] as const;

/**
 * ERC-20 Token Utilities
 */
export class ERC20Token {
  constructor(
    public address: Address,
    public chainId: number = 8453 // Base Mainnet
  ) {}

  async balanceOf(owner: Address): Promise<bigint> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [owner],
      chainId: this.chainId,
    });
    return result as bigint;
  }

  async decimals(): Promise<number> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'decimals',
      chainId: this.chainId,
    });
    return Number(result);
  }

  async symbol(): Promise<string> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'symbol',
      chainId: this.chainId,
    });
    return result as string;
  }

  async name(): Promise<string> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'name',
      chainId: this.chainId,
    });
    return result as string;
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, spender],
      chainId: this.chainId,
    });
    return result as bigint;
  }

  async transfer(to: Address, amount: string, decimals?: number): Promise<`0x${string}`> {
    const tokenDecimals = decimals ?? (await this.decimals());
    const amountWei = parseUnits(amount, tokenDecimals);
    
    const hash = await writeContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, amountWei],
      chainId: this.chainId,
    });

    return hash;
  }

  async approve(spender: Address, amount: string, decimals?: number): Promise<`0x${string}`> {
    const tokenDecimals = decimals ?? (await this.decimals());
    const amountWei = parseUnits(amount, tokenDecimals);
    
    const hash = await writeContract(config, {
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amountWei],
      chainId: this.chainId,
    });

    return hash;
  }

  formatBalance(balance: bigint, decimals?: number): Promise<string> {
    return Promise.resolve(
      formatUnits(balance, decimals ?? 18)
    );
  }
}

/**
 * ERC-721 NFT Utilities
 */
export class ERC721NFT {
  constructor(
    public address: Address,
    public chainId: number = 8453
  ) {}

  async ownerOf(tokenId: bigint): Promise<Address> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
      chainId: this.chainId,
    });
    return result as Address;
  }

  async balanceOf(owner: Address): Promise<bigint> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC721_ABI,
      functionName: 'balanceOf',
      args: [owner],
      chainId: this.chainId,
    });
    return result as bigint;
  }

  async tokenURI(tokenId: bigint): Promise<string> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC721_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
      chainId: this.chainId,
    });
    return result as string;
  }

  async transferFrom(from: Address, to: Address, tokenId: bigint): Promise<`0x${string}`> {
    const hash = await writeContract(config, {
      address: this.address,
      abi: ERC721_ABI,
      functionName: 'transferFrom',
      args: [from, to, tokenId],
      chainId: this.chainId,
    });

    return hash;
  }
}

/**
 * ERC-1155 Multi-Token Utilities
 */
export class ERC1155Token {
  constructor(
    public address: Address,
    public chainId: number = 8453
  ) {}

  async balanceOf(owner: Address, tokenId: bigint): Promise<bigint> {
    const result = await readContract(config, {
      address: this.address,
      abi: ERC1155_ABI,
      functionName: 'balanceOf',
      args: [owner, tokenId],
      chainId: this.chainId,
    });
    return result as bigint;
  }

  async safeTransferFrom(
    from: Address,
    to: Address,
    tokenId: bigint,
    amount: bigint,
    data: `0x${string}` = '0x'
  ): Promise<`0x${string}`> {
    const hash = await writeContract(config, {
      address: this.address,
      abi: ERC1155_ABI,
      functionName: 'safeTransferFrom',
      args: [from, to, tokenId, amount, data],
      chainId: this.chainId,
    });

    return hash;
  }
}

/**
 * Wait for transaction and return receipt
 */
export async function waitForTx(hash: `0x${string}`, chainId: number = 8453) {
  return waitForTransactionReceipt(config, {
    hash,
    chainId,
  });
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): address is Address {
  return isAddress(address);
}
