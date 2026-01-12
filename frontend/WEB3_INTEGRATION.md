# Web3 Integration Documentation

## Overview
CrossPay now includes comprehensive Web3 integration with multi-wallet support, smart contract utilities, IPFS integration, and enhanced transaction handling.

## Features

### 1. Multi-Wallet Support
- **Coinbase Wallet** (includes Base Wallet)
- **MetaMask**
- **WalletConnect** (mobile wallets)
- **Safe Wallet**
- **Phantom Wallet**
- **Farcaster Wallet** (in-frame)
- **Injected Wallets** (Rabby, Trust Wallet, etc.)

### 2. Smart Contract Utilities
Located in `src/lib/contracts.ts`:
- **ERC20Token**: ERC-20 token interaction class
  - `balanceOf()`, `transfer()`, `approve()`, `allowance()`
  - `decimals()`, `symbol()`, `name()`
  - `formatBalance()`

- **ERC721NFT**: ERC-721 NFT interaction class
  - `ownerOf()`, `balanceOf()`, `tokenURI()`
  - `transferFrom()`

- **ERC1155Token**: ERC-1155 multi-token interaction class
  - `balanceOf()`, `safeTransferFrom()`

### 3. IPFS Integration
Located in `src/lib/ipfs.ts`:
- `uploadToIPFS()`: Upload files to IPFS
- `uploadJSONToIPFS()`: Upload JSON metadata
- `uploadNFTMetadata()`: Upload NFT metadata with image
- `fetchFromIPFS()`: Fetch content from IPFS
- `getIPFSGatewayURL()`: Get gateway URL for CID

### 4. Transaction Handling
- **TransactionStatus Component**: Real-time transaction status tracking
- **useTransaction Hook**: Enhanced transaction hook with error handling
- **TransactionButton Component**: Reusable transaction button with loading states

### 5. Network Switching
- **NetworkSwitcher Component**: Switch between Base, Base Sepolia, and Ethereum Mainnet
- Automatic RPC URL configuration

### 6. Error Handling
Located in `src/lib/errors.ts`:
- `parseWeb3Error()`: Parse and format Web3 errors
- `getErrorMessage()`: Get user-friendly error messages
- `isRecoverableError()`: Check if error is recoverable
- Custom error classes: `Web3Error`, `TransactionError`, `ContractError`

### 7. Hooks
- **useTokenBalance**: Get ERC-20 token balance
- **useTransaction**: Enhanced transaction hook

## Usage Examples

### Send ERC-20 Token
```typescript
import { ERC20Token } from '@/lib/contracts';

const token = new ERC20Token('0x...', 8453); // Base Mainnet
const hash = await token.transfer(recipientAddress, '100.0');
```

### Upload NFT to IPFS
```typescript
import { uploadNFTMetadata } from '@/lib/ipfs';

const { metadataURI } = await uploadNFTMetadata(
  'My NFT',
  'Description',
  imageFile,
  [{ trait_type: 'Rarity', value: 'Legendary' }]
);
```

### Use Transaction Hook
```typescript
import { useTransaction } from '@/hooks/useTransaction';

const { sendTransaction, isLoading, hash } = useTransaction({
  onSuccess: (hash) => console.log('Success!', hash),
  onError: (error) => console.error('Error:', error),
});

await sendTransaction({
  to: recipientAddress,
  value: '0.1', // ETH
});
```

## Environment Variables

```env
NEXT_PUBLIC_WC_PROJECT_ID=your-walletconnect-project-id
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_IPFS_ENDPOINT=https://ipfs.io
NEXT_PUBLIC_IPFS_API_KEY=your-ipfs-api-key (optional)
NEXT_PUBLIC_IPFS_SECRET=your-ipfs-secret (optional)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## File Structure

```
frontend/src/
├── components/
│   ├── TransactionStatus.tsx    # Transaction status component
│   └── NetworkSwitcher.tsx       # Network switching component
├── hooks/
│   ├── useTokenBalance.ts        # Token balance hook
│   └── useTransaction.ts         # Enhanced transaction hook
├── lib/
│   ├── contracts.ts              # Smart contract utilities
│   ├── ipfs.ts                   # IPFS integration
│   └── errors.ts                 # Error handling utilities
└── providers/
    └── Web3Provider.tsx          # Enhanced Web3 provider
```

## Next Steps

1. Get WalletConnect Project ID from https://cloud.walletconnect.com
2. Configure IPFS endpoint (optional, uses public gateway by default)
3. Test wallet connections
4. Test transaction flows
5. Deploy to production
