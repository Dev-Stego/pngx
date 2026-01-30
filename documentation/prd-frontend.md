# PNGX - Frontend PRD

## Overview

The Frontend is a **Next.js 14** application deployed on Vercel. It acts as a "thick client," performing all heavy cryptographic operations in the browser (Client-Side Rendering) while using Next.js Server Components for layout, auth state, and static content.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + `shadcn/ui` + `framer-motion` (Animations)
- **State Management**: `zustand` (Global App State)
- **Forms**: `react-hook-form` + `zod`
- **Web3**: `wagmi` + `rainbowkit` + `viem`
- **Crypto**: Web Crypto API (Native) + `pbkdf2` package (Polyfill if needed)
- **Canvas**: Native HTML5 Canvas API (Image manipulation)

---

## Component Architecture

### 1. Atoms (Base UI)
- `Button`: Neon glow variants (Primary, Secondary, Ghost).
- `Card`: Glassmorphism effect container.
- `Input`: Borderless, bottom-lit fields.
- `DropZone`: Interactive drag area with particle effects.

### 2. Molecules (Features)
- `SocialConnectButton`:
    - Props: `provider` ('twitter', 'github'), `connected` (bool).
    - UI: Icon + "Connect" or "Handle".
- `NoteInput`: Password field with visibility toggle and strength indicator.
- `HistoryItem`: Compact row showing file icon, name, and status.

### 3. Organisms (Complex)
- `EncoderForm`: Handles file drop, note input, password, and "Encode" action.
- `DecoderForm`: Handles image drop, note/password input, and preview generation.
- `BlockchainBackupModal`: RainbowKit connect flow -> Sign Message -> Success State.
- `UserProfileCard`:
    - Displays Avatar (editable).
    - Displays Social Links (editable inputs).
    - Shows account stats.

---

## State Management (Zustand)

### `useAppStore`
- `user`: User Profile object (synced from Auth/Firestore).
- `theme`: 'dark' | 'light'.
- `processing`: Boolean (Is currently encoding/decoding?).
- `progress`: Number (0-100).
- `queue`: Array of files pending processing (Batch mode).

### `useWalletStore` (via Wagmi)
- Handled primarily by `wagmi` hooks, but wrapped for "Is Note Vault Available?" checks.

---

## Implementation Details

### Social Profile Enrichment
**Location**: `/settings` or `/profile` page.
**Behavior**:
1. User sees "Enrich Profile".
2. Inputs: "Twitter Handle", "GitHub Username".
3. **Future V2**: "Connect with X" button (OAuth) to auto-verify and fetch avatar.
   - For V1: Simple text fields saved to `users/{uid}` in Firestore.
   - Display: On the Dashboard header, show the connected Social Icons next to the User Avatar.

### Canvas Processing (The Core)
- **Off-screen Canvas**: All pixel manipulation happens on a `document.createElement('canvas')` (not attached to DOM) for performance.
- **Workers**: Use **Web Workers** for heavy encoding/decoding to prevent UI thread freezing during large file processing.

### Security Note Logic
- **Input**: User types note.
- **Normalization**: Trim whitespace, normalize Unicode (NFC).
- **Hashing**: `SHA-256(note)` stored in `users/{uid}/history` (optional, for "Did I use this note?" hint, but NEVER the plain note). *Wait, actually, for high security we should probably NOT store even the hash of the note centrally, or if we do, purely client side.* -> **Decision**: Do not store note hash in DB. Only store it in the encrypted file header (Salted) if needed for verification, or rely on AEAD tag failure.

---

## Route Structure

- `/` (Landing)
- `/dashboard` (Main App - Protected)
- `/vault` (Blockchain Recovery - Protected)
- `/history` (Activity Log - Protected)
- `/settings` (Profile & Config - Protected)
- `/share/[id]` (Public Shared File Download)
- `/admin/*` (Admin Panel - Restricted)
