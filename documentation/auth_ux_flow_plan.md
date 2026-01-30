# Authentication UX Flow Design

## Core Principles

1. **Wallet = Unique Identity** - One wallet address = One account
2. **Email = Unique Identity** - One email address = One account  
3. **No Duplicate Binding** - Cannot link wallet/email already used by another account
4. **Clear Error Messages** - Users understand why something failed

---

## User Journeys

### Journey 1: Sign In with Wallet (New User)
```
User clicks "Connect Wallet" → Connects MetaMask → Signs message
                                       ↓
                        Check: wallet in `wallets` collection?
                              /                    \
                           NO                       YES
                            ↓                         ↓
                   Create new account         Log in as existing user
                   (wallet is primary ID)     (returning user)
```

**Expected Result:** User sees their wallet address (e.g., `0x1234...abcd`) in the user menu.

---

### Journey 2: Sign In with Wallet (Returning User)
```
User clicks "Connect Wallet" → Same wallet as before → Signs message
                                       ↓
                        Wallet found in `wallets` collection
                                       ↓
                        Load existing profile → Show in UI
```

**Expected Result:** User sees their profile with wallet address + any linked email.

---

### Journey 3: Sign In with Email (Magic Link)
```
User enters email → Click "Send Link"
                        ↓
            Firebase handles uniqueness:
              - New email → Creates new Firebase user
              - Existing email → Logs into existing Firebase user
                        ↓
            Profile created/loaded from `users` collection
```

**Expected Result:** User sees their email in the user menu.

---

### Journey 4: Link Wallet to Email Account
```
Email user logged in → Profile page → Click "Link Wallet"
                                          ↓
                        Connect wallet → Sign message
                                          ↓
                        Check: wallet in `wallets` collection?
                              /                    \
                         NO (available)        YES (taken)
                            ↓                       ↓
                   Link to current account    ❌ Error: "This wallet
                   Update profile              is already linked to
                   Show success                another account"
```

---

### Journey 5: Link Email to Wallet Account  
```
Wallet user logged in → Profile page → Enter email → Click "Link"
                                          ↓
                        Check: email already in Firebase Auth?
                              /                    \
                         NO (available)        YES (taken)
                            ↓                       ↓
                   Send verification link    ❌ Error: "This email
                   On verify: link email      is already linked to
                   Update profile             another account"
```

---

## Data Model

### `wallets` Collection
```
/wallets/{walletAddress}
{
  uid: "firebase-user-id",
  address: "0x1234...",
  linkedAt: timestamp
}
```

### `users` Collection  
```
/users/{uid}
{
  uid: "...",
  email: "user@example.com",     // Optional for wallet-only users
  walletAddress: "0x1234...",    // Optional for email-only users
  displayName: "...",
  createdAt: timestamp,
  lastLogin: timestamp,
  ...
}
```

---

## Technical Implementation

### Key Constraint: Anonymous Auth Limitation

With Firebase Anonymous Auth, each wallet sign-in creates a **new** anonymous user. We can't "become" an existing user.

**Solution for MVP:**
1. When wallet exists → Read the existing profile → Use it as local state
2. The **wallet mapping** (`wallets` collection) is the source of truth
3. Profile data from `users` collection is read-only for returning wallet users
4. This works for display purposes, but updates require the original Firebase uid

**Production Solution (Future):**
Use Firebase Custom Tokens via a backend function:
1. Wallet signs message
2. Backend verifies signature  
3. Backend issues custom token for the linked uid
4. Client signs in with custom token → IS the original user

---

## Implementation Checklist

- [ ] **Wallet Sign-In**
  - [ ] Check if wallet exists in `wallets` collection
  - [ ] If new: create account with wallet as primary ID
  - [ ] If existing: load profile and display

- [ ] **Email Sign-In**
  - [ ] Firebase handles email uniqueness
  - [ ] Create profile on first sign-in
  - [ ] Load profile on returning sign-in

- [ ] **Link Wallet (from email account)**
  - [ ] Check if wallet is already linked to another account
  - [ ] Show error if taken
  - [ ] Link and update profile if available

- [ ] **Link Email (from wallet account)**
  - [ ] Check if email is already in use (query Firestore or try Firebase operation)
  - [ ] Show error if taken
  - [ ] Send verification link if available

- [ ] **Error Messages**
  - [ ] "This wallet is already linked to another account"
  - [ ] "This email is already linked to another account"

---

## UI States

| State | User Menu Shows | Profile Shows |
|-------|-----------------|---------------|
| Email-only user | Email + Badge | Email ✓, Wallet "Link" button |
| Wallet-only user | Wallet address + Badge | Wallet ✓, Email "Link" button |
| Both linked | Email + Badges for both | Email ✓, Wallet ✓ |
