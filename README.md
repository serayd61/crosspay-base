# CrossPay - Base Blockchain Payment Bridge

[![Base](https://img.shields.io/badge/Built_on-Base-0052FF?style=flat-square&logo=ethereum)](https://base.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Contract](https://img.shields.io/badge/Contract-Verified-success?style=flat-square)](https://basescan.org/address/0x4d45baa1909b7f061b514ef50034c55d0b79b262)

**Instant crypto payments for merchants on Base blockchain with minimal fees.**

CrossPay bridges traditional payment experiences with Base blockchain, enabling merchants to accept crypto payments as easily as credit cards. With QR code scanning, multi-wallet support, and only 1% fees.

## 🚀 Live Demo

**Try it now:** [Open CrossPay App](https://serayd61.github.io/crosspay-base/frontend/)

## 🆕 New: Loyalty Points System

The new `CrossPayLoyalty.sol` contract adds a complete rewards system:
- **Earn Points**: 1000 points per 1 ETH spent
- **Tier System**: Bronze → Silver → Gold → Platinum with increasing rewards
- **Merchant Campaigns**: Bonus multipliers for special promotions
- **Redeem Points**: Convert points to discounts on future purchases

| Tier | Points Required | Bonus Multiplier |
|------|-----------------|------------------|
| Bronze | 100 | 1.05x |
| Silver | 500 | 1.15x |
| Gold | 2,000 | 1.30x |
| Platinum | 10,000 | 1.50x |

## ✨ Key Features

### For Merchants
- 🏪 **Easy Registration** - Simple business onboarding in seconds
- 📱 **QR Code Payments** - Generate QR codes for instant customer payments  
- 📊 **Real-time Dashboard** - Track sales, revenue, and transaction history
- 💰 **Low Fees** - Only 1% platform fee (vs 3%+ traditional processors)
- ⚡ **Instant Settlement** - Payments settle immediately on Base
- 🛡️ **Daily Limits** - Configurable limits for risk management

### For Customers  
- 🔐 **Multi-wallet Support** - MetaMask, Coinbase Wallet, WalletConnect
- 📷 **QR Scanner** - Camera-based scanning with auto-fill
- 💳 **Familiar UX** - Payment experience like traditional apps
- 🌐 **ENS Support** - Send to .eth domains
- 📱 **Mobile Optimized** - Works perfectly on all devices

## 🎯 Problem & Solution

**Problem:** Crypto payments are complex for merchants and customers
- High fees (3-5% traditional processors)
- Complex wallet setups
- Poor user experience
- No unified payment standard

**Solution:** CrossPay simplifies crypto payments
- ✅ 1% fee (5x cheaper)
- ✅ One-click wallet connection
- ✅ QR code scanning like Venmo/PayPal
- ✅ Works with any Base wallet

## 🏗️ Technical Architecture

### Smart Contract (Solidity 0.8.20)
- **Address:** `0x4d45baa1909b7f061b514ef50034c55d0b79b262`
- **Network:** Base Mainnet (Chain ID: 8453)
- **Verified:** ✅ [View on BaseScan](https://basescan.org/address/0x4d45baa1909b7f061b514ef50034c55d0b79b262)

### Key Functions
- `registerMerchant()` - Business registration
- `payWithQR()` - QR-based payments with invoice tracking
- `payDirect()` - Direct merchant payments
- `processBatchPayments()` - Bulk payment processing

### Frontend
- **Framework:** Vanilla JS + Ethers.js
- **Wallets:** MetaMask, Coinbase, WalletConnect
- **QR Codes:** Generation (qrcode.js) + Scanning (qr-scanner.js)
- **Responsive:** Mobile-first design

## 📈 Market Opportunity

- **$7.4T** global payment processing market
- **$5.2B** in Base TVL (Total Value Locked)
- **Growing** merchant demand for crypto payments
- **Lower fees** than traditional processors

## 🎪 Demo Scenarios

### Merchant Use Case
1. Coffee shop registers as merchant
2. Generates QR code for counter display  
3. Customer scans QR → auto-fills payment
4. Instant settlement to merchant wallet
5. Dashboard shows real-time revenue

### Customer Use Case
1. Connect wallet (MetaMask/Coinbase)
2. Scan merchant QR code
3. Confirm payment amount
4. One-click payment completion
5. Transaction confirmed on Base

## 🔧 Quick Start

### For Users
1. Visit [CrossPay App](https://serayd61.github.io/crosspay-base/frontend/)
2. Connect your wallet (MetaMask/Coinbase)
3. Start making payments!

### For Developers
```bash
git clone https://github.com/serayd61/crosspay-base
cd crosspay-base
# Serve frontend
python -m http.server 8000
# Open http://localhost:8000/frontend/
```

## 📊 Smart Contract Features

- **Merchant Registry** - Business verification system
- **Payment Processing** - QR and direct payment methods
- **Fee Management** - 1% platform fee with admin controls
- **Daily Limits** - Risk management for merchants
- **Event Logging** - Complete transaction history
- **Withdrawal System** - Easy fund management

## 🛡️ Security Features

- ✅ Reentrancy protection
- ✅ Access control (owner-only functions)
- ✅ Input validation
- ✅ Daily transaction limits
- ✅ Emergency pause functionality
- ✅ Contract verification on BaseScan

## 📱 QR Code System

### Generation
- Payment requests with amount/recipient
- Merchant QR codes for customer scanning
- Compatible with standard wallet formats

### Scanning
- Real-time camera scanning
- Multiple format support
- Auto-fill payment forms
- Error handling and validation

## 🌟 Competitive Advantages

1. **Base-Native** - Built specifically for Base ecosystem
2. **Low Fees** - 1% vs 3-5% traditional processors  
3. **Better UX** - QR codes + wallet integration
4. **Instant Settlement** - No waiting periods
5. **Multi-wallet** - Works with any Base wallet
6. **Open Source** - Transparent and auditable

## 🎯 Roadmap

- ✅ **Phase 1:** MVP with QR payments (COMPLETED)
- ✅ **Phase 2:** Multi-wallet support (COMPLETED)
- ✅ **Phase 3:** QR scanning integration (COMPLETED)
- 🔄 **Phase 4:** Mobile app (IN PROGRESS)
- 📋 **Phase 5:** Merchant analytics dashboard
- 📋 **Phase 6:** Integration with Base ecosystem
- 📋 **Phase 7:** Cross-chain expansion

## 🤝 Contributing

We welcome contributions! Check out our [API Documentation](docs/api.md) for technical details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live App:** https://serayd61.github.io/crosspay-base/frontend/
- **Contract:** https://basescan.org/address/0x4d45baa1909b7f061b514ef50034c55d0b79b262
- **Documentation:** [docs/api.md](docs/api.md)
- **Base Ecosystem:** https://base.org/ecosystem

---

**Built with ❤️ on Base blockchain**