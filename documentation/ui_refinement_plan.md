
# Implementation Plan - UI & Flow Refinements

## 1. Profile Page (`app/(app)/profile/page.tsx`)
- **Goal:** Replace "Email" and "Wallet" badges with simple verified icons under the username.
- **Changes:**
    - Remove `Badge` components.
    - Render `Mail` and `Wallet` icons in a flex row.
    - Apply `text-green-500` (or theme equivalent) to indicate verification.
    - Add tooltips for clarity (e.g., "Email Verified", "Wallet Linked").

## 2. Navigation Bars
- **Files:**
    - `components/layout/app-header.tsx` (App)
    - `components/landing/site-header.tsx` (Marketing Site - pending location verification)
- **Changes:**
    - **Telegram:** Add Telegram icon link.
    - **Twitter/X:** Replace `Twitter` Lucide icon with a custom SVG for "X" (or similar appropriate icon) to match the new branding.

## 3. SecureProcessor (`components/secure-processor.tsx`)
- **Goal:** Make encryption mode selection explicit and manual.
- **Changes:**
    - Introduce state `encryptionMode`: `'quick' | 'steganography' | null` (default to 'quick' or null?). User implies "user clicks... to choose", so maybe default to null or just make the switching explicit.
    - **Selection Logic:**
        - Clicking "Quick Encrypt" sets mode to 'quick' and clears any cover image.
        - Clicking "Steganography" sets mode to 'steganography'.
    - **UI Rendering:**
        - Only show "Upload Cover Image" dropzone when `encryptionMode === 'steganography'`.
        - Visually highlight the selected mode card.

## 4. Verification
- Verify Profile icons appearance.
- Verify Navbar links and logos.
- Verify Encryption flow: Quick mode shouldn't show dropzone; Steg mode should.
