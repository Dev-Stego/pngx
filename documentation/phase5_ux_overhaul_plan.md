# Phase 5: Content-Rich Website & UX Overhaul

## Overview

Transform PNGX from a minimal tool into a **premium, content-rich application** with:
- Engaging landing page explaining all features
- **Login required** (no guest mode)
- Polished micro-animations and transitions
- Improved steganography UX with visual guidance
- Full mobile responsiveness

---

## 1. Remove Guest Mode - Require Login

> [!IMPORTANT]
> All app functionality will require authentication. Unauthenticated users see landing page only.

### Proposed Changes

#### [MODIFY] [use-history.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/hooks/use-history.ts)
- Remove `LocalHistory` fallback
- Return empty state for guests (force login)

#### [MODIFY] [secure-processor.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/secure-processor.tsx)
- Wrap entire processor in auth check
- Show "Login to start" CTA when not authenticated

#### [DELETE] [local-history.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/lib/local-history.ts)
- Remove guest localStorage history (no longer needed)

---

## 2. Content-Rich Landing Page

### New Sections to Add

| Section | Purpose |
|---------|---------|
| **Hero** | Compelling headline + animated demo |
| **How It Works** | 3-step visual process |
| **Features Grid** | All capabilities with icons |
| **Steganography Explainer** | Visual before/after comparison |
| **Security Section** | Trust signals, encryption details |
| **CTA** | Sign up / Login buttons |

#### [MODIFY] [page.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/app/page.tsx)
- Add feature sections below hero
- Conditional render: Landing (guests) vs App (authenticated)

#### [NEW] [components/landing/](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/landing/)
Create modular landing page components:
- `hero-section.tsx`
- `how-it-works.tsx`
- `features-grid.tsx`
- `steganography-explainer.tsx`
- `security-section.tsx`
- `cta-section.tsx`

---

## 3. Micro-Animations & Polish

### Animation Enhancements

| Element | Animation |
|---------|-----------|
| Page transitions | Fade + slide |
| Buttons | Scale on hover, ripple on click |
| Cards | Lift on hover (translateY + shadow) |
| File drops | Bounce on drop |
| Progress | Smooth gradient animation |
| Tab switches | Cross-fade content |
| Modals | Spring scale-in |
| Success states | Confetti / checkmark animation |

#### [MODIFY] [globals.css](file:///Users/rae/Documents/code/test/file-png-file/pngx/app/globals.css)
Add new animation keyframes:
- `fade-in-up`
- `scale-in`
- `shimmer`
- `pulse-glow`

#### [MODIFY] [button.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/ui/button.tsx)
Add hover scale and active press animations

---

## 4. Steganography UX Improvements

### Current Issues
- Cover image selection is confusing
- Capacity meter not prominent enough
- No visual preview of steganography process

### Proposed UX Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STEGANOGRAPHY MODE                        │
├──────────────────────────┬──────────────────────────────────┤
│   1. SELECT SECRET FILE  │   2. SELECT COVER IMAGE          │
│   ┌──────────────────┐   │   ┌──────────────────────────┐   │
│   │   📄 secret.pdf  │   │   │   🖼️ vacation.png        │   │
│   │   128 KB         │   │   │   1920x1080              │   │
│   └──────────────────┘   │   │   Capacity: 750 KB       │   │
│                          │   └──────────────────────────┘   │
├──────────────────────────┴──────────────────────────────────┤
│   CAPACITY METER                                             │
│   ████████████░░░░░░░░░░░░░░░░░░░░░░░░  17% used (128/750KB)│
│                                                              │
│   ✅ Your file will fit! Image will look identical.         │
├──────────────────────────────────────────────────────────────┤
│   [🔒 Hide File Inside Image]                                │
└──────────────────────────────────────────────────────────────┘
```

#### [MODIFY] [secure-processor.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/secure-processor.tsx)
- Redesign encode flow with side-by-side layout
- Add visual "before/after" preview
- Make capacity meter more prominent with color coding
- Add tooltips explaining each step

---

## 5. Mobile Responsiveness

### Breakpoints Strategy
- `sm` (640px): Stack layouts, full-width buttons
- `md` (768px): Side-by-side where possible
- `lg` (1024px): Full desktop experience

### Key Mobile Fixes
- Dropzones stack vertically on mobile
- Tab bar scrollable on small screens  
- Modals full-screen on mobile
- Touch-friendly button sizes (min 44px)
- Swipe gestures for tabs

---

## 6. Dark/Light Mode Polish

### Current Issues
- Some text contrast issues in light mode
- Border colors inconsistent

### Fixes
- Audit all color tokens
- Add proper light mode variants
- Ensure 4.5:1+ contrast ratios

---

## Implementation Priority

### Phase 5.1: Foundation
- [ ] Remove guest mode
- [ ] Create auth barrier component
- [ ] Basic landing page structure

### Phase 5.2: Content
- [ ] Hero section with animation
- [ ] Features grid
- [ ] How It Works section
- [ ] Steganography explainer

### Phase 5.3: Micro-Animations
- [ ] Button animations
- [ ] Card hover effects
- [ ] Page transitions
- [ ] Success animations

### Phase 5.4: Steganography UX
- [ ] Redesigned encode flow
- [ ] Visual capacity meter
- [ ] Before/after preview
- [ ] Step-by-step guidance

### Phase 5.5: Polish
- [ ] Mobile responsiveness audit
- [ ] Light mode fixes
- [ ] Final QA

---

## Verification

1. **Auth:** Logged-out users cannot access processor
2. **Content:** All feature sections render correctly
3. **Animations:** 60fps on mid-range devices
4. **Mobile:** Works on iPhone SE viewport
5. **Accessibility:** Keyboard nav, screen reader support
