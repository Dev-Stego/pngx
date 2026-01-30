# Secure Binding & Authentication Walkthrough

## Overview
We have implemented a robust "Secure Binding" system to resolve the "Permission Denied" and "Ghost User" issues. This ensures that:
1.  **Wallet Linking** is verified on the server (via signature), preventing client-side permission errors.
2.  **Email Linking** is verified on the server/client hybrid, ensuring the email is lawfully attached to the Firebase account.
3.  **Recoverability**: If a user loses their session ("Ghost User"), they can recover their account by simply signing the wallet message again.

## Changes Implemented

### 1. Backend Wallet Linking (`/api/auth/link-wallet`)
- **Old Way**: Client tried to write to `wallets/{address}`. If the wallet was already "linked" to a ghost user, the write failed (Permission Denied).
- **New Way**: Client sends `address` + `signature` + `message` to the backend.
- **Security**: The backend verifies the signature using `ethers`.
- **Recovery**: If the wallet is linked to a "Ghost User" (no valid identity), the backend "steals" it and links it to your current active session.

### 2. Backend Email Confirmation (`/api/auth/confirm-email-link`)
- **Old Way**: The verify page just updated Firestore. This left the actual Firebase Auth Credential unlinked.
- **New Way**:
    1.  User clicks link.
    2.  `verify/page` ensures user is logged in (restores session).
    3.  Calls `linkWithCredential` to officially attach the email.
    4.  Calls `/api/auth/confirm-email-link` to sync Firestore and Auth state.

### 3. Client Updates
- **`auth-provider.tsx`**: Updated `linkWallet` to use the new API.
- **`profile/page.tsx`**: Updated to pass the required `message` for signature verification.
- **`verify/page.tsx`**: Completely rewritten `handleLinkMode` for security.

## Verification Checklist

### Test: Link Wallet
1.  Sign in with Email/Google (fresh account).
2.  Go to Profile -> Click "Link Wallet".
3.  Sign the message.
4.  **Expected**: Success toast. Wallet appears in linked accounts. Firestore `wallets/{address}` updates to your UID.

### Test: Link Email
1.  Sign in with Wallet.
2.  Go to Profile -> Click "Link Email".
3.  Enter email -> Click "Send Link".
4.  Open email in **same browser**.
5.  **Expected**: "Email Linked!" success screen. Redirect to profile. Email badge appears.

### Test: Ghost Recovery (Advanced)
1.  If you have a wallet that gives "Permission Denied" errors:
2.  Simply try to "Sign In with Wallet" or "Link Wallet" again.
3.  **Expected**: The new system should detect it and auto-heal/claim the wallet.
