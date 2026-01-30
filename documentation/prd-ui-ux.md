# PNGX - UI/UX PRD

## Overview

The user interface for PNGX must be **award-winning**, futuristic, and highly intuitive. It combines widespread utility with a "hacker-chic" aesthetic that feels secure and premium.

## Design System: "Void & Neon"

### Core Philosophy
- **Darkness**: The interface lives in the void. Deep, rich blacks, not greys.
- **Light**: Actions are energy. Neon cyan and violet gradients indicate potential and kinetic energy.
- **Glass**: Context is depth. Glassmorphism layers separate content from the void.
- **Motion**: Data is alive. Subtle particle effects and smooth spring animations.

### Color Palette
- **Void Black**: `#050510` (Background)
- **Obsidian**: `#0F0F16` (Cards/Panels)
- **Neon Cyan**: `#00D4FF` (Primary Action, Encoding)
- **Cyber Violet**: `#B026FF` (Secondary, Decoding)
- **Matrix Green**: `#00FF9D` (Success, Verified)
- **Warning Orange**: `#FF9E00` (Alerts)
- **Error Red**: `#FF2A2A` (Critical)

### Typography
- **Headlines**: _Clash Display_ or _Rajdhani_ (Futuristic, bold)
- **Body**: _Inter_ or _Plus Jakarta Sans_ (Clean, legible)
- **Code/Data**: _JetBrains Mono_ (Technical, precise)

---

## Detailed User Flows

### 1. Landing Page (The Hook)
- **Hero**: A 3D floating "PNGX" cube that deconstructs into pixels and reconstructs as a file icon on hover.
- **Tagline**: Glitch-text animation revealing "More than an image."
- **Interactive Demo**: A simplified drop zone right in the hero. Users drag a file, it instantly pixelates into a visual noise pattern (preview).
- **Social Proof**: "Secured 1M+ Files" (future proofing).

### 2. Authentication (The Gate)
- **Method**: Email OTP (Passwordless).
- **Visual**: A clean, centered modal. background is blurred void.
- **Micro-interaction**: When OTP is sent, a wireframe paper plane animation flies from the button.
- **Social Enrichment**: "Connect Socials" step (optional) to pull avatar/bio.

### 3. Dashboard (The Command Center)
- **Layout**: Sidebar (collapsible on mobile) + Main Content Area.
- **Header**: User Greeting ("Hello, [Name]"), Wallet Status (if connected).
- **Main Action State**:
    - **Empty State**: A large, pulsing drop zone taking up 60% of screen center. "Drop confidential data here."
    - **File Selected**: Card flips to reveal file stats (Type, Size, Entropy).
    - **Mode Toggle**: A physical-switch style toggle: "ENCODE" (Cyan) vs "DECODE" (Violet).

### 4. Encoding Experience (The Transformation)
1. **Input**: User drops file.
2. **Configuration**:
    - **Security Note**: Input field with "eye" icon. Helper text: "This is your key. Don't lose it."
    - **Blockchain Backup**: Small "Shield" icon button. On click -> RainbowKit modal.
3. **Process**: Button "Hide File".
4. **Animation**: The file icon dissolves into a stream of binary, which swirls into a square frame, forming the noise image.
5. **Result**: The final PNG is displayed.
    - **Actions**: Download, Share (Link/QR), "Save Note to Vault".

### 5. Decoding Experience (The Revelation)
1. **Input**: Drop PNGX image.
2. **Verification**: System scans header.
    - *Valid*: "PNGX Signature Detected". Lock icon appears (Closed).
    - *Invalid*: "Standard Image Detected".
3. **Unlock**: User types Security Note.
    - *Success*: Lock shatters/opens. File preview appears.
    - *Failure*: Screen shakes red. "Access Denied".

### 6. User Profile (The Identity)
- **Enrichment**:
    - **Avatar**: Upload or fetch from Gravatar/GitHub.
    - **Social Links**: Input fields for Twitter/X, GitHub, LinkedIn. Verified badges if OAuth connected.
    - **Stats**: "Data Secured: 500MB", "Vault Items: 12".
- **History**: A timeline of activity. Each item is a glass card.
    - *Encrypted entry*: Blurred/Redacted visual.
    - *Decrypted entry*: Clear visual.
    - *Action*: "Download" or "Delete".

---

## Screen Specifications

### Desktop (1440px)
- **Grid**: 12-column fluid.
- **Margins**: 80px outer.
- **Components**: Cards use 16px rounded corners, 1px border `rgba(255,255,255,0.1)`.

### Mobile (375px)
- **Navigation**: Bottom Bar (Home, Vault, History, Profile).
- **Drop Zone**: Full screen height minus nav.
- **Gestures**: Swipe file card left to remove.

### Accessibility
- **Contrast**: All text meets WCAG AA.
- **Reduced Motion**: Option to disable heavy particle effects.
- **Screen Readers**: "Drop Zone" announces state changes clearly.
