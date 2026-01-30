# Walkthrough: Settings & Admin Foundation

I have implemented the User Settings page and the foundation for the Admin Panel.

## Implementations

### 1. User Settings Page (`/settings`)
- **Location:** `app/settings/page.tsx`
- **Features:**
    - **Account Card:** Displays User Avatar, Name, Email/Wallet, and ID.
    - **Danger Zone:** "Delete Account" placeholder (safety mechanism).
    - **Appearance:** Toggle for Light/Dark/System theme.
    - **About:** Version information.

### 2. Admin Panel Foundation (`/admin`)
- **Location:** `app/admin/*`
- **Layout:** `AdminLayout` with a dedicated Sidebar for navigation (Dashboard, Users, Safety, Settings).
- **Dashboard:** Basic stats grid (Users, Encrypted Files, etc.) and placeholders for charts/activity.
- **Security:** Checks for `user` presence (Note: Needs specific role-based check in production).

## Visual Verification
1.  **Settings**: Click "Settings" in the user dropdown. Verify theme toggle works.
2.  **Admin**: Navigate manually to `/admin`. Verify the sidebar Layout and Dashboard stats appear.
