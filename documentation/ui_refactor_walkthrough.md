# Full Page Popup UI Refactor

## Overview
We have unified the user interface for the **Settings**, **Profile**, and **History** pages by implementing a consistent "Full Page Popup" design. This enhances the user experience by treating these secondary screens as focused overlays with smooth entrance animations and standard navigation controls.

## Changes Implemented

### 1. `FullPageModal` Component
**File:** `components/ui/full-page-modal.tsx`
- Created a reusable wrapper component.
- **Features:**
  - Fixed full-screen overlay with backdrop blur.
  - Standardized header with Title, Description, and Close (X) button.
  - `Esc` key support to close the modal (navigates back).
  - Framer Motion entrance animations (fade in + slight slide up).
  - Slots for custom `action` elements (e.g., "Clear All" button).

### 2. Settings Page Refactor
**File:** `app/settings/page.tsx`
- Wrapped content in `FullPageModal`.
- Removed custom page header.
- Preserved existing "Account", "Appearance", and "About" cards within the new layout.

### 3. History Page Refactor
**File:** `app/history/page.tsx`
- Wrapped content in `FullPageModal`.
- Moved the "Clear All" button to the `action` slot of the modal header for better hierarchy.
- Preserved list view and empty state.

### 4. Profile Page Refactor
**File:** `app/profile/page.tsx`
- Wrapped content in `FullPageModal`.
- Removed the custom sticky header.
- Adjusted container alignment to fit the modal structure.
- Kept "Save Changes" and "Sign Out" actions at the bottom of the content area.

## Verification
- **Build Status:** Passed (`tsc --noEmit` verified).
- **UX Check:**
  - All three pages now share the same `FullPageModal` structure.
  - Navigation flows remain `router.push` based, but the UI feels like a cohesive overlay.
  - `Esc` key functionality added for accessibility and convenience.

## Next Steps
- Implement the **Admin Dashboard (Metrics UI)** as per the remaining task list.
