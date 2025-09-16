# CrossPay API Documentation

## Overview

CrossPay is a payment bridge system on Base blockchain that enables instant crypto payments for merchants with minimal fees. The system consists of a Solidity smart contract and a web frontend.

## Smart Contract

**Address:** `0x4d45baa1909b7f061b514ef50034c55d0b79b262`  
**Network:** Base Mainnet (Chain ID: 8453)  
**Solidity Version:** 0.8.20

## Contract Functions

### Merchant Management

#### `registerMerchant(string _businessName, string _businessType)`
Registers a new merchant account.

**Parameters:**
- `_businessName`: Name of the business
- `_businessType`: Type of business (cafe, restaurant, store, etc.)

**Requirements:**
- Business name must not be empty
- Address must not already be registered as merchant

**Events:** `MerchantRegistered(address indexed merchant, string businessName)`

#### `merchants(address)`
Returns merchant information.

**Returns:**
```solidity
struct Merchant {
    string businessName;
    string businessType;
    bool isActive;
    uint256 totalReceived;
    uint256 dailyVolume;
    uint256 lastResetDate;
    uint256 dailyLimit;
}
```

#### `getMerchantStats(address merchant)`
Gets merchant statistics.

**Returns:**
- `businessName`: Name of the business
- `totalReceived`: Total amount received (wei)
- `dailyVolume`: Current daily volume (wei)
- `availableLimit`: Remaining daily limit (wei)

### Payment Functions

#### `deposit()`
Deposits ETH to user's contract balance (prepaid system).

**Requirements:**
- `msg.value > 0`

**Events:** `FundsDeposited(address indexed user, uint256 amount)`

#### `payWithQR(address merchantAddress, uint256 amount, string invoiceId)`
Makes a payment to a merchant using QR code system.

**Parameters:**
- `merchantAddress`: Address of the merchant
- `amount`: Payment amount in wei
- `invoiceId`: Unique invoice identifier

**Requirements:**
- Merchant must be active
- User must have sufficient balance in contract
- Amount must be greater than 0
- Payment must not exceed merchant's daily limit

**Fee:** 1% platform fee (10/1000)

**Events:** `PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, string invoiceId)`

#### `payDirect(address merchantAddress)`
Makes a direct payment to a merchant.

**Parameters:**
- `merchantAddress`: Address of the merchant

**Requirements:**
- Merchant must be active
- `msg.value > 0`

**Fee:** 1% platform fee

**Events:** `PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, string "DIRECT")`

#### `processBatchPayments(BatchPayment[] batchPayments)`
Processes multiple payments in a single transaction.

**BatchPayment Structure:**
```solidity
struct BatchPayment {
    address merchant;
    uint256 amount;
    string invoiceId;
}
```

### Balance Management

#### `withdraw(uint256 amount)`
Withdraws funds from contract balance to user's wallet.

**Parameters:**
- `amount`: Amount to withdraw in wei

**Requirements:**
- User must have sufficient balance in contract

**Events:** `FundsWithdrawn(address indexed user, uint256 amount)`

#### `getBalance(address user)`
Returns user's balance in the contract.

**Parameters:**
- `user`: Address to check balance for

**Returns:**
- `uint256`: Balance in wei

### Admin Functions

#### `updatePlatformFee(uint256 newFeePercent)`
Updates platform fee percentage (owner only).

**Parameters:**
- `newFeePercent`: New fee percentage (max 50 = 5%)

#### `updateMerchantLimit(address merchant, uint256 newLimit)`
Updates merchant's daily limit (owner only).

#### `pauseMerchant(address merchant)`
Deactivates a merchant (owner only).

#### `activateMerchant(address merchant)`
Reactivates a merchant (owner only).

### View Functions

#### `getPlatformStats()`
Returns platform statistics.

**Returns:**
- `totalPayments`: Total number of payments processed
- `platformBalance`: Platform's accumulated fees
- `platformFeePercent`: Current platform fee percentage

## Events

### `MerchantRegistered(address indexed merchant, string businessName)`
Emitted when a new merchant registers.

### `PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, string invoiceId)`
Emitted when a payment is processed.

### `FundsDeposited(address indexed user, uint256 amount)`
Emitted when user deposits funds.

### `FundsWithdrawn(address indexed user, uint256 amount)`
Emitted when user withdraws funds.

## Frontend Integration

The frontend provides a complete user interface for:
- Multi-wallet connection (MetaMask, Coinbase, WalletConnect)
- Balance management
- Payment processing
- QR code generation and scanning with camera
- Merchant dashboard
- Transaction history

### Wallet Connection

Supported wallets:
- MetaMask
- Coinbase Wallet  
- WalletConnect (coming soon)
- Browser-injected wallets

### QR Code System

#### QR Code Generation
The frontend automatically generates QR codes for:
- **Payment Requests**: Users can generate QR codes for receiving payments
- **Merchant Payments**: Merchants get QR codes for customer scanning

#### QR Code Scanning
- **Camera Integration**: Uses device camera for real-time QR scanning
- **Format Support**: Supports multiple QR code formats
- **Auto-fill**: Automatically fills payment form with scanned data

#### Supported QR Formats

**Payment Request:**
```json
{
    "to": "0x...",
    "amount": "0.1",
    "network": "base",
    "chainId": 8453
}
```

**Merchant QR:**
```json
{
    "merchant": "0x...",
    "network": "base", 
    "contract": "0x4d45baa1909b7f061b514ef50034c55d0b79b262",
    "type": "merchant"
}
```

**Other Wallet QR (Compatibility):**
```json
{
    "address": "0x...",
    "amount": "0.1"
}
```

**Plain Address:**
- Simple wallet addresses (0x...)
- ENS names (name.eth)

#### QR Scanner Features
- **Real-time Scanning**: Live camera feed with scan region highlighting
- **Error Handling**: Clear error messages for invalid QR codes
- **Multi-format Support**: Works with various wallet QR code formats
- **Auto-close**: Scanner closes automatically after successful scan
- **Permission Handling**: Requests camera permission gracefully

## Error Handling

Common error messages:
- `"Only owner"`: Function restricted to contract owner
- `"Merchant not active"`: Merchant account is deactivated
- `"Insufficient balance"`: Not enough funds for transaction
- `"Daily limit exceeded"`: Payment exceeds merchant's daily limit
- `"Invalid name"`: Empty business name provided
- `"Already registered"`: Address already registered as merchant

## Rate Limits

- **Daily Limit:** Default 10 ETH per merchant per day
- **Platform Fee:** 1% on all merchant payments
- **Maximum Fee:** 5% (admin configurable)

## Security Features

- Reentrancy protection
- Daily transaction limits for merchants
- Owner-controlled merchant activation/deactivation
- Fee limits to prevent excessive charges
- Event logging for all major operations

## Gas Optimization

- Efficient struct packing
- Minimal external calls
- Batch payment processing
- Event-based transaction tracking

## Development

### Local Testing

1. Deploy contract to local testnet or Base Sepolia
2. Update `CONTRACT_ADDRESS` in `frontend/index.html`
3. Serve frontend files via HTTP server

### Contract Verification

The contract is verified on BaseScan for transparency and security auditing.

## Support

For technical support or questions about the API, please refer to the project repository or contact the development team.