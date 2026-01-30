# PNGX - Backend PRD

## Overview

Since PNGX is a "thick client" app, the backend responsibility is minimized to **Authentication**, **Persistance**, **Admin Operations**, and **Temporary Storage Management**. We use **Firebase Cloud Functions** (Node.js) and **Base L2 Smart Contracts**.

---

## Firebase Cloud Functions

### 1. Admin API (REST / Callable)
Restricted to users with `admin` custom claim.

- `getSystemStats()`:
    - Aggregates document counts from `stats` collection.
    - Returns: `{ users: 1200, encodes: 45000, storage: '45GB' }`.

- `manageUser(uid, action)`:
    - **Actions**: 'suspend', 'delete', 'promote_admin'.
    - Updates `auth` claims and `users/{uid}` doc status.

### 2. Scheduled Jobs (Cron)
- `cleanupExpiredShares()`:
    - **Trigger**: Every 1 hour.
    - **Logic**:
        1. Query `shared_links` where `expiresAt < now`.
        2. Loop results:
           - Delete file from Firebase Storage (`gs://...`).
           - Delete document from Firestore.
    - **Log**: "Cleaned up X expired files."

### 3. Auth Triggers
- `onCreateUser()`:
    - Trigger: Firebase Auth Create.
    - Action: Creates initial `users/{uid}` document with default structure.
    - **Social Enrichment**: If user signed up via Social Auth (e.g. Google), extract `photoURL` and `displayName` to populate profile.

---

## Blockchain Backend (Smart Contracts)

**Network**: Base L2 (Mainnet)
**Language**: Solidity 0.8.x

### `NoteVault.sol`

**Data Structure**:
- `mapping(address => mapping(bytes32 => bytes)) notes`
  - Key 1: User Address (Wallet)
  - Key 2: File Hash (SHA-256 of the *original* file, or the PNG? -> Better: Hash of the *Encoded PNG* to link it uniquely).
  - Value: Encrypted Note (Bytes).

**Functions**:
1. `storeNote(bytes32 fileHash, bytes memory encryptedNote)`:
   - Access: `public`.
   - Action: Overwrites entry. Emits `NoteStored`.
   - Security: No access control needed; user is signing for their own slot via `msg.sender`.

2. `deleteNote(bytes32 fileHash)`:
   - Action: Deletes entry. Frees storage.

**Gas Optimization**:
- Notes are short strings. Storing `bytes` is efficient on L2. Cost estimated < $0.05.

---

## Storage Rules (Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Temporary public shares folder
    match /shares/{shareId} {
      // Anyone can read (download)
      allow read: if true;
      // Only authenticated users can upload
      allow write: if request.auth != null;
    }
  }
}
```
*Note: The frontend generates a unique UUID for `shareId`. The Cron job handles deletion.*

---

## API Security

- **Rate Limiting**:
    - AppCheck enabled to prevent abuse of calls.
    - Cloud Functions limited to reasonable invocations/minute per IP.
- **Validation**:
    - All inputs validated with `zod` schema on backend before processing.
