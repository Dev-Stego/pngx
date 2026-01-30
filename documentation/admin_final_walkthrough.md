# Admin Security & Settings Enhancement

## Completed Work
I have fortified the Admin capabilities and system security controls.

### 1. Robust "Pause Registration"
- **Problem**: The "Pause" button only hid the UI, but Google Sign-In could still create accounts.
- **Solution**: Patched `AuthProvider` to perform a strict check against `getSystemSettings()` during login.
- **Enforcement**: If a **New User** tries to sign in while the system is paused, they are immediately signed out and blocked with an error. 
- **Fix**: Updated `firestore.rules` to allow public read access to `settings/global`, ensuring the check works before a user is authenticated.

### 2. Global File Inspector
- **New Feature**: "Safety" tab now lists **ALL** files in the system.
- **Backend**: Implemented `getAllHistory` using `collectionGroup` queries.
- **Indexing**: Configured the necessary **Single Field Index Exemption** for `history/timestamp`.

### 3. Settings UI Overhaul
- **Clarity**: Replaced ambiguous switches with clear **Enable/Disable Keys**.
- **Visuals**: Added explicit "MAINTENANCE ON" / "SYSTEM ACTIVE" badges.
- **Fixes**: Resolved all HTML structure/nesting errors in the Settings page.

## Verification
### Registration Block Test
1. Set "Pause New Registrations" to **PAUSED** in Admin > Settings.
2. Open Incognito window.
3. Attempt to sign in with a **New Google Account**.
4. **Result**: Login is rejected with "New registrations are currently paused".

### File Access Test
1. Go to Admin > Safety.
2. Verify that files from **all users** are visible in the list.
3. Verify that "Delete" works.

## Deployment
- Firestore Rules have been **successfully deployed** to `pngx-4cf12`.

> [!NOTE]
> If you see `net::ERR_NAME_NOT_RESOLVED` errors in your console, this indicates a local network/DNS issue blocking `firestore.googleapis.com`. The application code is correct, but your internet connection to Google services is failing.
