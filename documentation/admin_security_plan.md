# Admin Security & Safety Implementation Plan

## Goal Description
Implement comprehensive administrative controls including a "Safety Settings" page for global system configuration, detailed user management actions (Ban, Suspend/Pause, Delete), and isolate the Admin Dashboard behind a secure, wallet-based authentication flow.

## User Review Required
> [!IMPORTANT]
> **Admin Authentication Change**: The `/admin` routes will now require a tailored Wallet Login. The standard email/google login will **no longer** grant admin access, even for the owner. You MUST connect a whitelisted wallet to access the dashboard.

## Proposed Changes

### 1. Data Models & Types (`lib/firestore/types.ts`)
- [MODIFY] Update `UserProfile` to include `status`: `'active' | 'suspended' | 'banned'`.
- [NEW] Create `SystemSettings` interface for global config.

### 2. Admin Logic (`lib/firestore/admin.ts`)
- [NEW] `updateUserStatus(uid, status)`: Function to ban/suspend users.
- [NEW] `getSystemSettings()` / `updateSystemSettings()`: Manage global safety toggles.
- [NEW] `verifyAdminWallet(address)`: Check if a wallet is authorized for admin access.

### 3. Secure Admin Login (`app/(admin-auth)/`)
- [NEW] `app/admin-login/page.tsx`: A dedicated, standalone login page.
    - Features: Wallet Connect only. "Sign to Verify" challenge.
    - Visuals: Distinct, "secure vault" aesthetic.
- [MODIFY] `app/admin/layout.tsx`: 
    - Remove standard `useAuth` check.
    - Implement strict `useAdminAuth` guard that checks for a specific admin session token/state.

### 4. User Management (`app/admin/users/page.tsx`)
- [MODIFY] Add "Actions" dropdown to User Table.
    - **Ban**: Sets status to 'banned'. User cannot login.
    - **Pause**: Sets status to 'suspended'. User reads only.
    - **Delete**: Permanently removes user.
- [MODIFY] Update badges to show status (Red for Banned, Yellow for Suspended).

### 5. Safety Settings Page (`app/admin/safety/page.tsx`)
- [NEW] Implementation of the Safety Dashboard.
    - **Global Switches**: 
        - [ ] Maintenance Mode (All writes disabled)
        - [ ] Pause New Registrations
    - **Content Controls**:
        - [ ] Max Upload Size Limit
        - [ ] Restricted File Types (e.g., block .exe)

## Verification Plan

### Automated Tests
- N/A (Manual verification heavily relied upon for UI/Auth flows)

### Manual Verification
1.  **Wallet Login**: Try accessing `/admin` directly -> Redirect to `/admin-login`.
2.  **Auth Flow**: Connect non-admin wallet -> Access Denied. Connect admin wallet -> Access Granted.
3.  **User Controls**: Ban a test user. Verify they cannot perform actions in the main app.
4.  **Safety Toggles**: Enable "Maintenance Mode". Verify users cannot upload files.
