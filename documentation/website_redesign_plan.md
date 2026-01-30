# PNGX Website Redesign V2 - Implementation Plan

> **Key Changes from V1**:
> - Website (landing) and Application (encoder) are **separate routes**
> - Heavy use of existing **ReactBits components** 
> - **Generated visual assets** for each section
> - **Glassmorphism** design system

---

## Architecture Change

| Route | Purpose | Current State |
|-------|---------|---------------|
| `/` | **Marketing Website** | Landing page with detailed sections |
| `/app` | **Application** | The encoder/decoder tool |
| `/docs/*` | **Documentation** | Existing docs |

---

## ReactBits Components to Use

| Component | Usage Locations |
|-----------|----------------|
| `Aurora` | Hero background |
| `DecryptedText` | Hero headline animation |
| `TiltCard` | Feature cards (hover effect) |
| `PixelCard` | Mode visualization backgrounds |
| `Squares` | Section decorative backgrounds |
| `GlitchText` | Section headers |
| `ShinyText` | CTAs and badges |
| `BlurText` | Subheadlines |
| `Spotlight` | Card highlights |
| `GradientText` | Accent text |

---

## Proposed Changes

### Architecture

#### [NEW] [page.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/app/app/page.tsx)
- Move current encoder (`SecureProcessor`) to `/app` route
- This becomes the main application page for actual file encryption

#### [MODIFY] [page.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/app/page.tsx)  
- Pure marketing landing page (no encoder embedded)
- Links to `/app` via CTA buttons
- All sections focus on education and conversion

---

### Landing Page Sections (Updated)

#### Section 1: Hero
**Components**: `Aurora`, `DecryptedText`, `ShinyText`
**Copy**:
- Headline: "Hide Anything. Inside Any Image."
- Subheadline: "Military-grade AES-256 encryption meets invisible steganography. Your files vanish into plain sight."
- CTA: "Launch App" → `/app`

**Visual Asset**: Hero background with encrypted data visualization

---

#### Section 2: How It Works
**Components**: `TiltCard`, `BlurText`
**Copy**:
```
Step 1: SELECT
Choose any file — documents, images, videos, up to 50MB. 
Drag and drop or click to browse.

Step 2: ENCRYPT  
Pick your mode: Quick Encrypt for speed, or Steganography 
to hide inside a carrier image invisibly.

Step 3: SHARE
Download your secure PNG. Share via email, cloud, or social. 
Only your security note can unlock it.
```
**Visual Asset**: 3-panel process illustration with icons

---

#### Section 3: Encryption Modes
**Components**: `PixelCard`, `TiltCard`
**Detailed Copy**:

**Quick Encrypt Mode**:
> Your file is encrypted using AES-256-GCM and converted directly into a unique PNG image. The output looks like colorful noise — a visual representation of your encrypted data. Fast, simple, and perfect for personal backups.

**Steganography Mode (LSB Injection)**:
> Your encrypted file is hidden inside a real image using Least Significant Bit modification. The algorithm modifies the least noticeable parts of each pixel — invisible to the human eye but recoverable by PNGX. The output looks identical to your original carrier image.

**Visual Assets**:
- Quick Encrypt: Before/after showing file → noise pattern
- Steganography: Before/after showing identical images with hidden data callout

---

#### Section 4: Security Architecture
**Components**: `GlitchText`(header), `TiltCard` (feature cards)
**Detailed Copy**:

```
Zero-Trust. Zero-Knowledge.

We built PNGX on a simple principle: we should never be able 
to access your data, even if we wanted to.

┌─────────────────────────────────────────────────────────┐
│  YOUR FILE                                              │
│     ↓                                                   │
│  PBKDF2-HMAC-SHA256 (100,000 iterations)               │
│     ↓                                                   │
│  256-bit AES Key                                        │
│     ↓                                                   │
│  AES-256-GCM Encryption                                 │
│     ↓                                                   │
│  STEF Header (metadata + auth tag)                      │
│     ↓                                                   │
│  LSB Injection / Pixel Packing                          │
│     ↓                                                   │
│  PNG OUTPUT                                             │
└─────────────────────────────────────────────────────────┘

Features:
• Client-Side Only — Files never leave your browser
• AES-256-GCM — Same encryption banks and governments use
• PBKDF2 — 100,000 iterations protects against brute force
• Authenticated Encryption — Tampering is detected instantly
• Open Source — Verify our security claims yourself
```

**Visual Asset**: Animated encryption pipeline diagram

---

#### Section 5: Blockchain Recovery
**Components**: `TiltCard`, `GradientText`
**Detailed Copy**:

```
Never Lose Your Keys Again

Traditional password managers require you to trust a third party. 
PNGX Blockchain Backup uses your Ethereum wallet as your master key.

How It Works:
1. Connect your wallet (MetaMask, Rainbow, etc.)
2. Sign a message — this generates a unique encryption key
3. Your security note is encrypted and stored on-chain
4. Recover from any device by signing with the same wallet

Self-Custodial:
Your wallet = your key. No one else can decrypt your notes, 
including us. Lose your wallet seed phrase, lose access.
```

**Visual Asset**: Wallet → signature → blockchain flow animation

---

#### Section 6: Use Cases
**Components**: `TiltCard` grid
**6 Cards with detailed descriptions**:

| Use Case | Description |
|----------|-------------|
| **Secure Cloud Backup** | Upload encrypted files to Google Photos, iCloud, or Dropbox. Even if your cloud is breached, attackers see only normal-looking images. |
| **Hidden Communication** | Embed encrypted messages in vacation photos. Perfect for journalists, activists, or anyone needing private channels. |
| **Seed Phrase Storage** | Store crypto wallet recovery phrases inside family photos. Hidden in plain sight, protected by AES-256. |
| **Whistleblowing** | Transport sensitive documents that appear as ordinary images. Pass inspection, reveal the truth later. |
| **Digital Dead Drops** | Share files publicly where only the intended recipient has the security note to decrypt. |
| **IP Protection** | Watermark creative work with hidden signatures. Prove ownership without visible marks. |

**Visual Assets**: Icon illustrations for each use case

---

#### Section 7: FAQ
**Detailed Q&A**:

| Question | Answer |
|----------|--------|
| Is steganography legal? | Yes, in most countries. It's simply hiding data within data. The content you encrypt is subject to normal laws. |
| What if I lose my security note? | Your data is permanently lost. We use zero-knowledge architecture — we can't recover it. Use blockchain backup! |
| Can I share on social media? | No. Platforms compress images (JPEG), destroying hidden data. Share the original PNG via email or file transfer. |
| How much can I hide? | ~1 byte per 3 pixels. A 1920×1080 image holds ~850KB. The encoder shows a capacity meter. |
| Is my data uploaded? | Never. Everything happens in your browser via Web Crypto API. We have no servers that could store your data. |
| Can someone detect hidden data? | Quick Encrypt: visible noise. Steganography: nearly impossible without statistical analysis. |
| What encryption do you use? | AES-256-GCM with PBKDF2 key derivation (100K iterations). Same as banking apps. |
| Is this open source? | Yes! Audit the entire codebase on GitHub. |

---

#### Section 8: CTA Banner
**Components**: `Aurora` background, `ShinyText` CTA
**Copy**:
```
Your Secrets Deserve Better Protection

Join thousands who trust PNGX to keep their files invisible.
100% client-side. No accounts. Open source.

[Launch PNGX App →]
```

---

## Visual Assets to Generate

| Asset | Description | Location |
|-------|-------------|----------|
| `hero_background.png` | Abstract cyber mesh with encrypted data visualization | Hero |
| `process_steps.png` | 3-panel illustration: Upload → Encrypt → Share | How It Works |
| `quick_encrypt_demo.png` | File → Noise pattern transformation | Modes |
| `steganography_demo.png` | Before/after showing identical images | Modes |
| `encryption_pipeline.png` | Animated flow diagram | Security |
| `blockchain_flow.png` | Wallet → Chain → Recovery | Blockchain |
| `usecase_*.png` | 6 icon illustrations | Use Cases |

---

## Verification Plan

### Automated
```bash
# Build verification
npm run build

# TypeScript check
npx tsc --noEmit
```

### Browser Testing
1. Navigate to `http://localhost:3000` — verify landing page loads
2. Scroll through all sections — verify animations render smoothly
3. Click "Launch App" CTA — verify redirect to `/app`
4. Navigate to `http://localhost:3000/app` — verify encoder works
5. Test responsive design at mobile (375px) and tablet (768px) widths

### Manual Verification
Ask user to:
1. Review landing page design and copy for accuracy
2. Confirm CTA links correctly to `/app`
3. Test encoding a file from the new `/app` route

---

## User Review Required

> [!IMPORTANT]
> Please review:
> 1. **Architecture**: Is `/` (marketing) + `/app` (encoder) the right separation?
> 2. **Copy**: Are the detailed writeups accurate to the product?
> 3. **Visual Assets**: Should I start generating these with AI?

---

## Next Steps Upon Approval

1. Create `/app` route with the encoder
2. Refactor landing page to use ReactBits components
3. Generate visual assets for each section
4. Integrate assets into components
5. Verify build and test in browser
