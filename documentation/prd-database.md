# PNGX - Database PRD

## Overview

PNGX uses **Cloud Firestore** (NoSQL) for high-speed, flexible data storage. The database stores user metadata, social profiles, conversion history, and temporary share links.

**Note**: Actual file contents and security notes are **NEVER** stored in the database.

---

## Schema Collections

### 1. `users` (Collection)
Primary user profiles.
- **Document ID**: `uid` (from Firebase Auth)

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Normalized email address |
| `displayName` | string | User's public name |
| `photoURL` | string | Avatar URL |
| `createdAt` | timestamp | Account creation date |
| `lastLogin` | timestamp | Last activity |
| `isPremium` | boolean | Future-proofing for pro plans |
| `storageUsed` | number | Total bytes processed (stats) |
| `socials` | map | Social media enrichment |
| &nbsp;&nbsp;`twitter` | string | Handle or Profile URL |
| &nbsp;&nbsp;`github` | string | Handle or Profile URL |
| &nbsp;&nbsp;`linkedin`| string | Profile URL |
| `preferences` | map | User settings |
| &nbsp;&nbsp;`theme` | string | 'dark', 'light', 'system' |
| &nbsp;&nbsp;`useHardwareAccel` | boolean | For encoding performance |

### 2. `history` (Sub-collection)
`users/{uid}/history/{historyId}`
Tracks encoding/decoding activity for the user's dashboard.

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | 'ENCODE' or 'DECODE' |
| `fileName` | string | Original filename |
| `fileSize` | number | Size in bytes |
| `fileHash` | string | SHA-256 hash (for integrity checks) |
| `timestamp` | timestamp | When it happened |
| `status` | string | 'COMPLETED', 'FAILED' |
| `noteVaultTx` | string | (Optional) Transaction hash if backed up to blockchain |
| `isShared` | boolean | If currently active share link exists |

### 3. `shared_links` (Collection)
Temporary records for public share links.
- **Document ID**: `shareId` (Auto-generated UUID)

| Field | Type | Description |
|-------|------|-------------|
| `ownerId` | string | UID of creator |
| `fileRef` | string | Firebase Storage path (gs://...) |
| `passwordProtected`| boolean | Does the *file* have a password? (Metadata only) |
| `expiresAt` | timestamp | 24h from creation |
| `downloadCount` | number | Usage tracking |
| `meta` | map | File metadata (name, size) |

### 4. `admins` (Collection)
Privileged users for the admin panel.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | User UID |
| `role` | string | 'SUPER_ADMIN', 'MODERATOR' |
| `permissions` | array | ['ban_users', 'view_analytics'] |

### 5. `stats` (Collection)
Aggregated system analytics.
- **Document ID**: `daily_{YYYY-MM-DD}`

| Field | Type | Description |
|-------|------|-------------|
| `encodes` | number | Total encodes today |
| `decodes` | number | Total decodes today |
| `newUsers` | number | Signups today |
| `totalVolume` | number | Total bytes processed |

---

## Indexing Strategy

1. **History List**:
    - Collection Group: No (Sub-collection only)
    - Fields: `uid` (Asc), `timestamp` (Desc)
    - Purpose: Quickly show user's recent files.

2. **Expired Shares Cleanup**:
    - Collection: `shared_links`
    - Fields: `expiresAt` (Asc)
    - Purpose: Cloud Function periodically queries `< now` to delete files.

---

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // History sub-collection
      match /history/{historyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public read for valid share links, Write only by owner
    match /shared_links/{shareId} {
      allow read: if resource.data.expiresAt > request.time;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    
    // Admin only
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
    }
  }
}
```
