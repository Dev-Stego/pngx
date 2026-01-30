# Admin Security & Safety Updates

## Overview
We have implemented a robust security layer for the Admin Dashboard, including separate wallet-based authentication, advanced user management controls, and global system safety settings.

## 1. Secure Wallet Admin Login
**URL:** `/admin-login` (Redirects automatically from `/admin` if not authenticated)

**Features:**
- **Separate Route:** Isolated from the main app login flow.
- **Wallet-Only Access:** Use your Web3 wallet (Metamask, Rainbow, etc.) to sign in.
- **Guard Mechanism:** `app/admin/layout.tsx` now enforces wallet verification.
    - *Development Note:* Currently allows any connected wallet. In production, connect your logic to a hardcoded list or `admins` collection in Firestore.

**Screenshot:**
> (Imagine a sleek, dark-themed login card with a "Connect Admin Wallet" button)

## 2. Safety Dashboard
**URL:** `/admin/safety`

**Features:**
- **Maintenance Mode:** Toggle to disable all write operations (uploads, encoding).
- **Registration Pause:** Stop new users from signing up.
- **Content Controls:** Set max upload size (MB) and restricted file types (e.g., `.exe`).

## 3. User Controls
**URL:** `/admin/users`

**New Actions:**
- **Suspend (Pause):** User can login but functionality is read-only.
- **Ban:** User is completely blocked from the platform.
- **Unban:** Restore user access.

**UI Updates:**
- Status Badges (Red for Banned, Orange for Suspended) are now visible in the user list.
- "Actions" dropdown menu added to each user row.

## Next Steps
- Add real admin wallet addresses to the `admins` collection in Firestore to lock down access properly.
