# PNGX Feature Research & Expansion Plan

> **Last Updated:** February 2026  
> **Status:** Research Complete → Ready for Implementation

---

## Executive Summary

This document covers deep research on four major feature expansions for PNGX:

1. **Browser Extension** - MetaMask-like experience with embedded wallet
2. **Google Drive Integration** - Cloud storage for encoded images
3. **Mobile Gallery** - Secure in-app image gallery
4. **Token Utility** - PNGX token for storage/file size tiers

---

## 1. Browser Extension Architecture

### Overview
A Chrome/Firefox extension that brings PNGX functionality to any webpage, with an embedded wallet for blockchain features.

### Recommended Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| **Framework** | Plasmo | React-first, TypeScript, hot reload, multi-browser |
| **Wallet** | Privy SDK | Embedded wallet, social login, best UX |
| **Storage** | chrome.storage.local | Encrypted, synced across devices |
| **Crypto** | Web Crypto API | Native browser support |

### Extension Components

#### 1.1 Popup UI (400x600px)
- Login/account status with Privy
- Quick encode (drag & drop file)
- Quick decode (paste image URL)
- Recent activity list
- Settings and preferences

#### 1.2 Content Script
- Right-click context menu on images
- "Encode into this image" option
- "Decode this image" option
- Overlay UI for inline results

#### 1.3 Background Service Worker
- Handle authentication state
- Manage wallet connection
- Process encode/decode operations
- Sync with PNGX web app

#### 1.4 Side Panel (Chrome 114+)
- Full app experience in sidebar
- Persistent while browsing
- Complex operations

### Data Flow
```
User right-clicks image → Content script captures →
Sends to service worker → Process encode/decode →
Save to storage/Google Drive → Show result overlay
```

### Project Setup
```bash
# Create extension project
pnpm create plasmo pngx-extension --with-src

# Install dependencies
cd pngx-extension
pnpm add @privy-io/react-auth fast-png
pnpm add -D @anthropic-ai/sdk

# Development
pnpm dev  # Chrome
pnpm dev --target=firefox-mv2  # Firefox
```

### Security Considerations
- Private keys never leave extension context
- Use `chrome.storage.session` for sensitive data (cleared on browser close)
- CSP must allow Web Crypto API
- CORS handled via background service worker

### File Structure
```
pngx-extension/
├── src/
│   ├── popup.tsx           # Main popup UI
│   ├── background.ts       # Service worker
│   ├── contents/
│   │   └── overlay.tsx     # Content script
│   ├── components/         # Shared UI
│   ├── lib/
│   │   ├── crypto/         # Shared from web app
│   │   ├── steganography/  # Shared from web app
│   │   └── wallet/         # Privy integration
│   └── storage.ts          # chrome.storage wrapper
├── assets/                 # Icons, images
└── package.json
```

### Timeline: 2-3 weeks

---

## 2. Google Drive Integration

### Overview
Allow users to save encoded images directly to Google Drive, with folder organization and sync.

### Recommended Approach

**Google Picker API + Drive API v3**
- Client-side only (no server tokens needed)
- User selects destination folder
- `drive.file` scope (only PNGX files)

### Scope Selection
```
Recommended: https://www.googleapis.com/auth/drive.file
- Only accesses files created by PNGX
- Most privacy-friendly
- Users trust app more
```

### Implementation

#### 2.1 Setup Google Cloud Console
1. Create project in Google Cloud Console
2. Enable Google Drive API
3. Enable Google Picker API
4. Create OAuth 2.0 credentials
5. Add authorized origins

#### 2.2 Client Library
```typescript
// lib/storage/google-drive.ts

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

export async function initGoogleDrive(): Promise<void> {
  await gapi.load('client:picker');
  await gapi.client.init({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
}

export async function uploadToGoogleDrive(
  file: Blob,
  filename: string,
  folderId?: string
): Promise<{ id: string; webViewLink: string }> {
  const metadata = {
    name: filename,
    mimeType: 'image/png',
    parents: folderId ? [folderId] : undefined,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  return response.json();
}

export async function showFolderPicker(): Promise<string | null> {
  return new Promise((resolve) => {
    const picker = new google.picker.PickerBuilder()
      .addView(new google.picker.DocsView(google.picker.ViewId.FOLDERS).setSelectFolderEnabled(true))
      .setCallback((data) => {
        if (data.action === google.picker.Action.PICKED) {
          resolve(data.docs[0].id);
        } else {
          resolve(null);
        }
      })
      .build();
    picker.setVisible(true);
  });
}
```

#### 2.3 UI Integration
```typescript
// In secure-processor.tsx

const handleSaveToGoogleDrive = async () => {
  if (!encodingResult) return;
  
  const folderId = await showFolderPicker();
  if (!folderId) return;
  
  const response = await fetch(encodingResult.imageUrl);
  const blob = await response.blob();
  
  const result = await uploadToGoogleDrive(
    blob,
    `pngx-${file.name}-${Date.now()}.png`,
    folderId
  );
  
  toast.success('Saved to Google Drive!');
};
```

### OAuth Flow Options

**Option A: Extend Firebase Auth**
```typescript
// Already using Google sign-in
// Request additional scope during login
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
```

**Option B: Separate OAuth (Recommended)**
```typescript
// Keep auth separate from storage
// User explicitly authorizes Drive access
// Better for privacy perception
```

### Timeline: 1 week

---

## 3. Mobile App Gallery Feature

### Overview
A secure, encrypted gallery within the PNGX mobile app for storing and organizing encoded images.

### Key Features

#### 3.1 Secure Storage
- Images stored in app sandbox (not device gallery)
- Encrypted SQLite database for metadata
- Optional biometric lock for gallery access
- Thumbnails cached, full images on-demand

#### 3.2 Organization
- Folders/Albums
- Tags and search
- Sort by date, name, size
- Grid view / List view

#### 3.3 Sync Options
- iCloud backup (iOS) - opt-in
- Google Drive sync (Android) - opt-in
- Cross-device via Firebase
- Export to device gallery (with warning)

### Data Model
```typescript
interface GalleryItem {
  id: string;
  localUri: string;           // Path in app sandbox
  thumbnailUri: string;
  originalFilename: string;   // Hidden file's name
  encodedAt: Date;
  fileSize: number;
  encryptionMode: 'quick' | 'steganography';
  noteHint?: string;          // Optional hint (NOT the actual note)
  backupStatus: 'local' | 'blockchain' | 'cloud';
  tags: string[];
  albumId?: string;
}

interface Album {
  id: string;
  name: string;
  coverImageId?: string;
  createdAt: Date;
  itemCount: number;
}
```

### Implementation

#### 3.4 Storage Layer
```typescript
// lib/gallery/storage.ts
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

const GALLERY_DIR = FileSystem.documentDirectory + 'pngx-gallery/';
const THUMBNAILS_DIR = GALLERY_DIR + 'thumbnails/';

export async function initGallery(): Promise<void> {
  await FileSystem.makeDirectoryAsync(GALLERY_DIR, { intermediates: true });
  await FileSystem.makeDirectoryAsync(THUMBNAILS_DIR, { intermediates: true });
}

export async function saveToGallery(
  imageUri: string,
  metadata: Omit<GalleryItem, 'id' | 'localUri' | 'thumbnailUri'>
): Promise<GalleryItem> {
  const id = generateId();
  const filename = `${id}.png`;
  const localUri = GALLERY_DIR + filename;
  
  await FileSystem.copyAsync({ from: imageUri, to: localUri });
  
  const thumbnailUri = await generateThumbnail(localUri, id);
  
  const item: GalleryItem = {
    id,
    localUri,
    thumbnailUri,
    ...metadata,
  };
  
  await saveMetadata(item);
  return item;
}
```

#### 3.5 UI Components
```typescript
// components/gallery/GalleryGrid.tsx
import { FlatList, Image, TouchableOpacity } from 'react-native';

export function GalleryGrid({ items, onItemPress }: Props) {
  return (
    <FlatList
      data={items}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onItemPress(item)}>
          <Image 
            source={{ uri: item.thumbnailUri }}
            style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
          />
          {item.backupStatus === 'blockchain' && (
            <View style={styles.backupBadge}>
              <Shield size={12} color="green" />
            </View>
          )}
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Privacy Features
- Gallery hidden from device file browsers
- No auto-upload to iCloud Photo Library
- Separate encryption key derived from user auth
- "Panic wipe" - quick delete all with confirmation
- Auto-lock after X minutes of inactivity

### Timeline: Included in Mobile App Phase (4-6 weeks total)

---

## 4. Token Utility Model

### Overview
PNGX token provides real utility through storage tiers, file size limits, and blockchain backup credits.

### Tier Structure

| Tier | Token Required | Hold/Stake | Storage | Max File | Blockchain Backup |
|------|----------------|------------|---------|----------|-------------------|
| **Free** | 0 | - | 100MB | 5MB | ❌ |
| **Bronze** | 100 PNGX | Hold | 1GB | 50MB | ✅ (5/month) |
| **Silver** | 1,000 PNGX | Hold | 10GB | 500MB | ✅ (Unlimited) |
| **Gold** | 10,000 PNGX | Stake | 100GB | 2GB | ✅ + Priority |
| **Platinum** | 100,000 PNGX | Stake | Unlimited | 5GB | ✅ + API Access |

### Utility Mechanisms

#### 4.1 Hold-to-Use (Simple)
- Check token balance on-chain
- Balance >= threshold = tier unlocked
- No locking, user keeps liquidity
- Easy to implement

#### 4.2 Stake-to-Unlock (Advanced)
- Lock tokens in contract
- Earn staking rewards from protocol fees
- Higher commitment = better benefits
- 7-day unstaking cooldown

#### 4.3 Burn-to-Use (Deflationary)
- Blockchain backup costs small PNGX burn
- Creates deflationary pressure
- Aligns usage with token value
- Example: 1 PNGX burned per backup

### Token Economics

```
Total Supply: 100,000,000 PNGX (Fixed, no inflation)

Distribution:
├── 40% Community/Airdrop (vested over 2 years)
├── 25% Team (4-year vest, 1-year cliff)
├── 20% Treasury/Development
├── 10% Initial Liquidity (DEX)
└── 5%  Advisors/Partners

Revenue to Treasury:
├── Premium subscriptions (fiat → buy PNGX)
├── API usage fees
├── Enterprise licensing
└── NFT royalties (2.5%)
```

### Smart Contracts

#### 4.4 ERC-20 Token Contract
```solidity
// contracts/PNGXToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PNGXToken is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("PNGX", "PNGX") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10**decimals());
    }
}
```

#### 4.5 Staking Contract
```solidity
// contracts/PNGXStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PNGXStaking is ReentrancyGuard {
    IERC20 public immutable pngxToken;
    
    uint256 public constant UNSTAKE_COOLDOWN = 7 days;
    
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 unstakeRequestedAt;
    }
    
    mapping(address => StakeInfo) public stakes;
    
    enum Tier { FREE, BRONZE, SILVER, GOLD, PLATINUM }
    
    uint256[] public tierThresholds = [0, 100e18, 1000e18, 10000e18, 100000e18];
    
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        pngxToken.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].stakedAt = block.timestamp;
        stakes[msg.sender].unstakeRequestedAt = 0;
    }
    
    function requestUnstake() external {
        require(stakes[msg.sender].amount > 0, "Nothing staked");
        stakes[msg.sender].unstakeRequestedAt = block.timestamp;
    }
    
    function unstake() external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.unstakeRequestedAt > 0, "Request unstake first");
        require(block.timestamp >= info.unstakeRequestedAt + UNSTAKE_COOLDOWN, "Cooldown not complete");
        
        uint256 amount = info.amount;
        info.amount = 0;
        info.unstakeRequestedAt = 0;
        
        pngxToken.transfer(msg.sender, amount);
    }
    
    function getUserTier(address user) external view returns (Tier) {
        uint256 balance = pngxToken.balanceOf(user) + stakes[user].amount;
        
        for (uint256 i = tierThresholds.length - 1; i > 0; i--) {
            if (balance >= tierThresholds[i]) {
                return Tier(i);
            }
        }
        return Tier.FREE;
    }
}
```

### Frontend Integration

```typescript
// hooks/use-user-tier.ts
import { useAccount, useReadContract } from 'wagmi';

export function useUserTier() {
  const { address } = useAccount();
  
  const { data: tier } = useReadContract({
    address: PNGX_STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserTier',
    args: [address],
    query: { enabled: !!address },
  });
  
  const tierNames = ['Free', 'Bronze', 'Silver', 'Gold', 'Platinum'];
  const tierLimits = {
    storage: [100, 1000, 10000, 100000, Infinity], // MB
    fileSize: [5, 50, 500, 2000, 5000], // MB
    backupsPerMonth: [0, 5, Infinity, Infinity, Infinity],
  };
  
  return {
    tier: tier ?? 0,
    tierName: tierNames[tier ?? 0],
    limits: {
      storage: tierLimits.storage[tier ?? 0],
      fileSize: tierLimits.fileSize[tier ?? 0],
      backups: tierLimits.backupsPerMonth[tier ?? 0],
    },
  };
}
```

### Timeline: 2-3 weeks

---

## 5. Production Hardening Checklist

### 5.1 Security Headers (Day 1)
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

### 5.2 Unit Tests (Days 2-3)
```bash
npm install -D vitest @testing-library/react jsdom
```

Test files to create:
- `lib/crypto/__tests__/encryption.test.ts`
- `lib/crypto/__tests__/note-generator.test.ts`
- `lib/steganography/__tests__/lsb.test.ts`
- `lib/steganography/__tests__/payload.test.ts`

### 5.3 E2E Tests (Days 4-5)
```bash
npm install -D @playwright/test
npx playwright install
```

Test files to create:
- `e2e/encode-decode.spec.ts`
- `e2e/blockchain-backup.spec.ts`
- `e2e/auth-flow.spec.ts`

### 5.4 Legal Pages (Day 6)
- Review `/legal/privacy` - ensure GDPR compliance
- Review `/legal/terms` - add crypto/blockchain disclaimers
- Add cookie consent if analytics enabled

### 5.5 Final Audit (Day 7)
```bash
npm audit fix
npm run build
npm run lint
```

---

## Implementation Priority

| Priority | Feature | Timeline | Dependencies |
|----------|---------|----------|--------------|
| 1 | Production Hardening | 1 week | None |
| 2 | Token Contract | 2 weeks | Hardening complete |
| 3 | Google Drive | 1 week | Can parallel with token |
| 4 | Browser Extension | 2-3 weeks | Token contract ready |
| 5 | Mobile App + Gallery | 4-6 weeks | All above complete |

---

## Next Steps

1. **Immediate:** Start security headers implementation
2. **This week:** Complete unit tests for crypto functions
3. **Next week:** Deploy token contract to testnet
4. **Parallel:** Set up Google Cloud project for Drive API

---

*This document will be updated as implementation progresses.*
