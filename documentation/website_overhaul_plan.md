# Website Content & Design Overhaul Plan

## Goal
Transform the current simple landing page into a comprehensive, feature-rich product website that explains "PNGX" (ShadeOfColor2) in detail.

## Content Sections
1.  **Hero Section**: 
    - Strong Headline: "Invisible Privacy for the Digital Age."
    - Subheadline: "Military-grade encryption hidden inside standard images. 100% Client-side."
    - Visual: Hero abstract image (Generated).

2.  **How It Works (The Workflow)**:
    - Step 1: Select Image & File.
    - Step 2: Encrypt with Password.
    - Step 3: Download & Share.
    - *Visuals*: Workflow icons/graphics.

3.  **Core Technology**:
    - **AES-256 GCM**: Explain the encryption standard.
    - **Steganography**: Explain how data is hidden in pixels.
    - **Compression**: GZIP compression before encryption.

4.  **Privacy Promise**:
    - "Zero Knowledge": We never see your password.
    - "No Servers": All processing happens in your browser.
    - "Open Source": Verifiable code.

5.  **Blockchain Backup (Web3)**:
    - Explain the optional decentralized backup feature.

## UI/UX Changes
- **Header**: Add X (Twitter) and Telegram icons. Keep GitHub.
- **Footer**: Add detailed links and social icons again.
- **Design System**: Use the existing "Premium Dark Mode" aesthetic (Glassmorphism, gradients).

## Assets Generation
I will generate the following images using `generate_image`:
1.  `hero_visualization`: Abstract data merging with image pixels.
2.  `encryption_diagram`: Schematic of AES-256 encryption.
3.  `steganography_layers`: Visualizing the hidden data layer.
4.  `local_privacy_shield`: A stylized shield representing client-side security.

## File Changes
- `app/page.tsx`: Full rewrite.
- `components/layout/header.tsx` (or update logic in `app/page.tsx` if header is inline): Extract Header to reusable component if possible, or update inline.
- `components/layout/footer.tsx`: Update inline footer in `app/page.tsx` or extract.
