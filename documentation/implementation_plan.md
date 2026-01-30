# Backend Wallet Auth Implementation

## Problem
Users face a "Permission Denied" loop when signing in with a wallet. This happens because the client-side code tries to query/update a wallet document (`wallets/{address}`) or user profile (`users/{oldUid}`) while signed in as a *different* anonymous user. Firestore Security Rules correctly block this.

## Solution
Implement a **Server-Side Wallet Login** flow.
1. Client signs a message.
2. Server (`/api/auth/wallet-login`) verifies the signature.
3. Server checks if the wallet is linked to an existing user.
4. Server generates a **Custom Auth Token** for that user (or a new one).
5. Client signs in with this token, instantly becoming the correct user with full permissions.

## Proposed Changes

### 1. Backend API
- **[NEW]** `app/api/auth/wallet-login/route.ts`:
  - POST endpoint receiving `address` and `signature`.
  - Verifies signature matches `address` using `ethers`.
  - Queries `wallets` collection (using Firebase Admin, bypassing rules).
  - Mint custom token via `adminAuth.createCustomToken(uid)`.

### 2. Frontend Auth Logic
- **[MODIFY]** `components/auth/auth-provider.tsx`:
  - Update `signInWithWallet` to POST to the new API.
  - Use `signInWithCustomToken(auth, token)` instead of `signInAnonymously()`.
  - Remove complex client-side recovery logic (server handles it).

### 4. Secure Binding Implementation
- **[NEW]** `app/api/auth/link-wallet/route.ts`:
  - POST endpoint.
  - Verifies signature.
  - Uses Admin SDK to securely update `wallets/{address}` (force claim) and `users/{uid}`.
  - Prevents "Already Linked" client-side errors.

- **[NEW]** `app/api/auth/confirm-email-link/route.ts`:
  - POST endpoint.
  - Updates Firebase Auth user record: `adminAuth.updateUser(uid, { email, emailVerified: true })`.
  - Updates Firestore: `users/{uid}`.
  - Ensures future email logins resolve to the correct Wallet User.

- **[MODIFY]** `app/auth/verify/page.tsx`:
  - Call `/api/auth/confirm-email-link` instead of just updating Firestore.

#### [MODIFY] [auth-provider.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/auth/auth-provider.tsx)
- Update `linkWallet` to use the new API.
- Update `linkEmail` to potentially prepare requirements for verification.
