# PNGX Website Redesign V2 - Task Checklist

## Phase 1: Architecture Separation
- [x] Create `/app` route with SecureProcessor
- [x] Fix double header/footer on marketing pages (docs/legal) <!-- id: fix_double_headers -->
- [x] Fix Profile/History page title overlap (FullPageModal) <!-- id: fix_modal_overlap -->
- [x] Add Settings link to Profile menu and fix History icon <!-- id: fix_nav_icons -->
- [x] Add divider on Dashboard page <!-- id: add_dashboard_divider -->
- [x] Refine spacing in SecureProcessor component <!-- id: refine_spacing -->
- [x] Refine Profile verified icons <!-- id: refine_profile_icons -->
- [x] Update Navbars (Telegram + X logo) <!-- id: update_navbars -->
- [x] Refactor SecureProcessor mode selection <!-- id: refactor_encryption_mode -->
- [x] Update CTAs to link to `/app`

## Phase 2: Hero Section (ReactBits)
- [x] Integrate `Aurora` background
- [x] Add `DecryptedText` for headline
- [x] Add `ShinyText` badge
- [x] Generate hero visual asset

## Phase 3: How It Works Section
- [x] Use `TiltCard` for process steps
- [x] Add `BlurText` for descriptions
- [x] Generate process illustration

## Phase 4: Modes Comparison (ReactBits)
- [x] Use `PixelCard` for Quick Encrypt visual
- [x] Use `TiltCard` for mode cards
- [x] Generate mode comparison assets

## Phase 5: Security & Blockchain
- [x] Use `GlitchText` for headers
- [x] Create encryption pipeline visual
- [x] Generate blockchain flow asset

## Phase 6: Use Cases & FAQ
- [x] Create `TiltCard` grid for use cases
- [x] Ensure FAQ is cleaner
- [x] Generate use case icons

## Final Polish
- [x] Verify mobile responsiveness
- [x] Check performance/load times
- [x] Final UI review
- [x] Verify build
- [x] Browser testing
- [x] Create walkthrough

---


## Phase 7: Navigation & Auth Refinement
- [x] Remove redundant "Sign In / App" from Header
- [x] Fix Helper Links (Technology -> #how-it-works, Privacy -> /legal/privacy)
- [x] Add `id` anchors to landing sections
- [x] Wire Hero "Start Encrypting" to Auth Logic


## Phase 8: UI & Docs Refinement
- [x] Header: Remove Theme Toggle & Fix Privacy Link
- [x] Home: Add "Tech Spec" link to Security Section
- [x] Guide: Generate "Choose" Asset (Reused existing)
- [x] Guide: Generate "Encrypt" Asset (Reused existing)
- [x] Guide: Generate "Download" Asset (Reused existing)
- [x] Guide: Implement Visuals in Page

- [x] Guide: Implement Visuals in Page

## Phase 9: Security Hardening
- [x] Protect `/app` route with `ProtectedRoute` layout
- [ ] Audit other protected routes (`/history`, `/profile`)

## Phase 10: CTA & Guide Overhaul
- [x] Create `AuthCTA` component (Auth Barrier)
- [x] Wire `CTABanner` to LoginModal
- [x] Wire `GuidePage` CTA to LoginModal
- [x] Wire `Hero` CTA to LoginModal (Standardization)
- [x] Rebuild Guide Page with Code-Based UI Assets

## Phase 11: Content & Bug Fixes
- [x] Fix Login Redirect Bug (force route to `/app`)
- [x] Create Blockchain Identity Docs (`/docs/blockchain`) and link "Learn More"
- [x] Update How It Works text (Secure Identity)
- [x] Style Encryption Docs (`/docs/encryption`) with Premium UI

## Phase 12: App Dashboard Overhaul & Stats Fixes
- [x] Remove duplicate `HistoryPanel` from `SecureProcessor`
- [x] Fix Zero Stats: Implement transactional increments for `storageUsed` and `filesEncrypted`
- [x] Privacy: Sanitize download filenames (remove original name references)
- [x] UI Polish: Add `Waves` animated background and "Secure Steganography Vault" heading

**Current Phase**: Phase 12 - App Dashboard Overhaul

## Phase 13: Feedback Fixes (Data & UI)
- [x] Fix History/Stats: Verified transaction logic (Encryption triggers update)
- [x] Settings: Remove Appearance section (Dark Mode Only)
- [x] UI: Update "Generate Secure Image" button styling (Liquid Glass)
- [x] UI: Replace `Waves` animation with `Aurora`
- [x] Bug: Fix User Profile Creation & Session Logic
- [x] Bug: Fix Build Errors (Syntax & Imports) in AuthProvider
- [ ] Bug: Fix "Unknown User" display name issue (Self-healing)

## Phase 14: Secure Authentication Binding
- [x] Create `/api/auth/link-wallet` (Server-side signature verification)
- [x] Create `/api/auth/confirm-email-link` (Server-side Auth sync)
- [x] Secure `auth-provider.tsx` (Use API for linking)
- [x] Secure `verify/page.tsx` (Use `linkWithCredential`)
- [x] Update `profile/page.tsx` (Pass message for signature)

## Phase 15: App Layout & UX Refinement
- [x] Create `(marketing)` route group for Landing, Docs, Legal
- [x] Create `(app)` route group for App, Profile, History
- [x] Implement `(marketing)/layout.tsx` (Full Header/Footer)
- [x] Implement `(app)/layout.tsx` (Minimal Header/Footer + Protection)
- [x] Add Auth Loading States (Spinners/Toasts)
- [x] Audit Protected Routes (`/history`, `/profile`)


