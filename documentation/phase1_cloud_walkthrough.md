# Phase 1: Core Cloud Features Walkthrough

This update transitions PNGX from a local-only tool to a cloud-connected platform with cross-device sync and secure sharing.

## Features Implemented

### 1. Auto-Generated Security Notes
- **What it is:** The system now automatically generates a cryptographically secure note (e.g., `apple-river-house-4829`) for every encryption.
- **Why:** Eliminates weak user-created passwords (like "123456").
- **Usage:**
  - When you hide a file, the note is generated instantly.
  - You can **Copy** it or **Download as .txt**.
  - **Important:** You must save this note to recover the file later.

### 2. Secure Cloud Sharing
- **What it is:** A new "Share" button allows you to generate a secure link for your encrypted file.
- **How it works:**
  - The encoded PNG is uploaded to **Firebase Storage**.
  - A unique share link is created (e.g., `pngx.app/share/abc-123`).
  - You can set **Expiration** (1 day, 7 days, etc.) and **Max Downloads**.
  - Optional **Password Protection** for the link itself.

### 3. Cross-Device History Sync
- **What it is:** Your history is now synced to the cloud via **Firestore**.
- **The Magic:** 
  - When you encode a file while logged in, it's automatically uploaded to your private storage.
  - You can open PNGX on your phone, see the history item, and **Download** the encoded image directly.
  - Guest users still have local-only history (via LocalStorage).

## Technical Implementation

- **Backend:** Firebase Firestore (Metadata), Firebase Storage (Files).
- **Client:** React Hooks (`useHistory`) abstract the complexity of Local vs. Cloud sync.
- **Security:**
  - Files are encrypted **client-side** before upload.
  - Server never sees the unencrypted file or the security note.
  - Share links have independent lifecycle management (deletion/expiry).

## How to Verify

1. **Log In** to the app.
2. **Hide a File:**
   - Select an image/file.
   - Click "Hide File".
   - Note the auto-generated security note.
3. **Check History:**
   - Refresh the page or open a new tab/browser.
   - The verified file should appear in "Recent Activity".
   - Click the **Download** icon to verify cloud retrieval.
4. **Test Sharing:**
   - Click the "Share" button on the result card.
   - Create a link (e.g., expires in 1 day).
   - Copy the link and open it in Incognito mode to simulate a recipient.

## Next Steps (Phase 2)
- **Blockchain Backup:** Store recovery notes on-chain (optional).
- **IPFS Integration:** Decentralized storage alternative.
