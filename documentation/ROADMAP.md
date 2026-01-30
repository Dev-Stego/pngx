# PNGX Development Roadmap

> **Last Updated:** January 2026  
> **Status:** MVP Complete → Production Hardening

---

## Overview

PNGX is a secure file-to-image steganography platform with AES-256-GCM encryption and blockchain-backed note recovery. This roadmap outlines the path from current MVP to production-ready application, mobile expansion, and crypto utility integration.

### Current Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Blockchain:** BNB Smart Chain + BNB Greenfield
- **Crypto:** AES-256-GCM, PBKDF2 (100k iterations), LSB Steganography

---

## Phase 1: Production Ready
**Timeline:** 2-3 weeks  
**Goal:** Ship a stable, secure web application

### 1.1 Smart Contract Deployment
- [x] Improve contract with size limits and pagination
- [x] Add soft-delete functionality
- [x] Integrate BNB Greenfield object references
- [x] Update ABI and TypeScript types
- [ ] Deploy to BNB Testnet (Chain ID: 97)
- [ ] Test full backup/restore flow
- [ ] Deploy to BNB Mainnet (Chain ID: 56)
- [ ] Verify contract on BscScan

**Deployment Commands:**
```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network bscTestnet
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

### 1.2 BNB Greenfield Integration
- [ ] Install Greenfield JS SDK: `npm install @bnb-chain/greenfield-js-sdk`
- [ ] Create bucket: `pngx-backups` (testnet) / `pngx-backups-mainnet`
- [ ] Implement `lib/greenfield/client.ts`:
  - [ ] `uploadEncryptedNote(note: string, userAddress: string): Promise<string>`
  - [ ] `downloadEncryptedNote(objectId: string): Promise<string>`
  - [ ] `deleteObject(objectId: string): Promise<void>`
- [ ] Update backup flow to upload to Greenfield first, then store reference on-chain
- [ ] Add Greenfield testnet tokens for testing

**Architecture:**
```
User encrypts note → Upload to Greenfield → Get objectId → Store hash + objectId on BSC
User retrieves → Read objectId from BSC → Download from Greenfield → Decrypt
```

### 1.3 Testing
- [ ] Unit tests for crypto functions (`lib/crypto/`)
  - [ ] `encryption.test.ts` - AES-GCM encrypt/decrypt
  - [ ] `note-generator.test.ts` - Note generation entropy
- [ ] Unit tests for steganography (`lib/steganography/`)
  - [ ] `lsb.test.ts` - Encode/decode integrity
  - [ ] `payload.test.ts` - Header parsing
- [ ] E2E tests with Playwright
  - [ ] `encode-decode.spec.ts` - Full flow
  - [ ] `steganography-mode.spec.ts` - Cover image flow
  - [ ] `blockchain-backup.spec.ts` - Web3 integration
- [ ] Visual regression tests for UI components

**Test Setup:**
```bash
npm install -D vitest @testing-library/react playwright
npx playwright install
```

### 1.4 Security Hardening
- [ ] Add Content Security Policy headers in `next.config.ts`
- [ ] Add HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] Rate limiting on Firebase Functions
- [ ] Input validation and sanitization audit
- [ ] Dependency security audit: `npm audit`
- [ ] Remove console.log statements in production

**Security Headers Example:**
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];
```

### 1.5 Legal & Compliance
- [ ] Privacy Policy page (`/legal/privacy`) - GDPR compliant
- [ ] Terms of Service page (`/legal/terms`)
- [ ] Cookie consent banner (if analytics added)
- [ ] Data retention policy documentation

### 1.6 Production Deployment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Configure Firebase production project
- [ ] Enable Firebase App Check
- [ ] Set up monitoring (Vercel Analytics / Sentry)

---

## Phase 2: Token/NFT Integration
**Timeline:** 2-3 weeks  
**Goal:** Monetization via tiered NFT access

### 2.1 Tokenomics Design
- [ ] Define tier structure:
  ```
  Free:     5MB max, 5 encodes/day, no blockchain backup
  Bronze:   50MB max, unlimited encodes, blockchain backup
  Silver:   500MB max, priority processing, API access
  Gold:     Unlimited, custom branding, support
  ```
- [ ] Decide: NFT vs ERC-20 staking vs hybrid
- [ ] Design NFT artwork (4 tiers)
- [ ] Plan minting economics (price, supply)

### 2.2 NFT Smart Contract
- [ ] Create `PNGXAccess.sol` (ERC-721)
  - [ ] Tier metadata on-chain
  - [ ] Upgradeable tiers (burn + mint new)
  - [ ] Admin mint for giveaways
- [ ] Deploy to BNB testnet
- [ ] Test tier verification
- [ ] Deploy to BNB mainnet

**Contract Structure:**
```solidity
contract PNGXAccess is ERC721 {
    enum Tier { FREE, BRONZE, SILVER, GOLD }
    mapping(uint256 => Tier) public tokenTier;
    
    function getUserTier(address user) external view returns (Tier);
    function mint(address to, Tier tier) external payable;
}
```

### 2.3 Frontend Integration
- [ ] Create `hooks/use-user-tier.ts`
- [ ] Gate features based on tier
- [ ] Create minting page `/mint`
- [ ] Add tier badge to UI
- [ ] Show upgrade prompts for free users

### 2.4 Marketplace Integration
- [ ] List on OpenSea / Element Market (BNB)
- [ ] Add royalty configuration (2.5%)
- [ ] Create collection metadata

---

## Phase 3: Mobile Application
**Timeline:** 4-6 weeks  
**Goal:** Cross-platform mobile app with wallet integration

### 3.1 Technology Selection
**Recommended Stack:**
- **Framework:** React Native with Expo
- **Wallet:** Privy SDK (embedded wallet, social login)
- **Crypto:** `react-native-quick-crypto`
- **Storage:** `expo-secure-store` for keys
- **Image Processing:** `expo-image-manipulator`

### 3.2 Project Setup
- [ ] Initialize Expo project
- [ ] Configure TypeScript
- [ ] Set up shared code structure with web
- [ ] Configure EAS Build

```bash
npx create-expo-app pngx-mobile --template expo-template-blank-typescript
cd pngx-mobile
npx expo install expo-secure-store expo-image-manipulator
npm install @privy-io/expo
```

### 3.3 Core Features
- [ ] Port crypto functions (ensure Web Crypto API compatibility)
- [ ] Implement LSB steganography for mobile
- [ ] File picker integration
- [ ] Camera integration for quick capture
- [ ] Share extension (encode from share menu)

### 3.4 Wallet Integration (Privy)
- [ ] Set up Privy account and API keys
- [ ] Implement social login (Google, Apple)
- [ ] Embedded wallet creation
- [ ] Transaction signing for backup
- [ ] Wallet export option

**Why Privy over WalletConnect:**
- No separate wallet app needed
- Social login creates wallet invisibly
- Better UX for non-crypto users
- Works on iOS App Store guidelines

### 3.5 Platform-Specific
- [ ] iOS: Configure App Store submission
- [ ] iOS: Handle photo library permissions
- [ ] Android: Configure Play Store submission
- [ ] Android: Handle storage permissions
- [ ] Push notifications for backup reminders

### 3.6 Testing & Release
- [ ] Internal testing (TestFlight / Internal Track)
- [ ] Beta testing program
- [ ] App Store submission
- [ ] Play Store submission

---

## Phase 4: Advanced Features
**Timeline:** Ongoing  
**Goal:** Feature expansion and developer ecosystem

### 4.1 Batch Processing
- [ ] Multi-file selection UI
- [ ] Queue management
- [ ] Progress tracking per file
- [ ] Zip download option

### 4.2 Developer API
- [ ] REST API design
- [ ] API key management
- [ ] Rate limiting per tier
- [ ] Documentation (OpenAPI/Swagger)
- [ ] SDK packages (npm, pip)

**API Endpoints:**
```
POST /api/v1/encode
POST /api/v1/decode
GET  /api/v1/backups
POST /api/v1/backups
```

### 4.3 Browser Extension
- [ ] Chrome extension
- [ ] Firefox extension
- [ ] Right-click context menu
- [ ] Toolbar popup for quick encode

### 4.4 Advanced Crypto Features
- [ ] Split-key sharing (Shamir's Secret)
- [ ] Time-locked encryption
- [ ] Dead man's switch (auto-reveal)
- [ ] Multi-sig backup recovery

### 4.5 Enterprise Features
- [ ] Team workspaces
- [ ] Admin dashboard
- [ ] Audit logs
- [ ] SSO integration
- [ ] Custom branding

---

## Technical Debt & Maintenance

### Ongoing Tasks
- [ ] Dependency updates (monthly)
- [ ] Security patches (as needed)
- [ ] Performance monitoring
- [ ] User feedback integration
- [ ] Documentation updates

### Known Issues to Address
- [ ] No offline/PWA support yet
- [ ] No internationalization
- [ ] Limited error recovery UI
- [ ] No accessibility audit

---

## Success Metrics

### Phase 1 (Production)
- [ ] 0 critical security vulnerabilities
- [ ] <3s encode time for 5MB file
- [ ] 99.9% uptime
- [ ] Successful blockchain backup/restore

### Phase 2 (Token)
- [ ] 1000+ NFTs minted
- [ ] 50%+ conversion to paid tiers
- [ ] Active secondary market

### Phase 3 (Mobile)
- [ ] 10,000+ downloads
- [ ] 4.5+ app store rating
- [ ] <2% crash rate

---

## Resources

### Documentation
- [BNB Smart Chain Docs](https://docs.bnbchain.org/bnb-smart-chain/)
- [BNB Greenfield Docs](https://docs.bnbchain.org/bnb-greenfield/)
- [Greenfield JS SDK](https://github.com/bnb-chain/greenfield-js-sdk)
- [Privy Documentation](https://docs.privy.io/)
- [Expo Documentation](https://docs.expo.dev/)

### Testnet Faucets
- [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [Greenfield Testnet Faucet](https://gnfd-bsc-faucet.bnbchain.org/)

### Contract Addresses
```
BNB Testnet (97):     <TO BE DEPLOYED>
BNB Mainnet (56):     <TO BE DEPLOYED>
```

---

## Changelog

### January 2026
- Initial roadmap creation
- Smart contract improvements completed
- BNB chain configuration added
- Greenfield integration planned

---

*This document is maintained by the PNGX development team and updated as milestones are completed.*
