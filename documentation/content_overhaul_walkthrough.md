# Visual & Content Overhaul Walkthrough

We have separated the "App" experience from the "Website" experience and added missing feature documentation.

## 1. Dynamic Hero Animation
The static hero image has been replaced with a code-based animation (`HeroAnimation.tsx`) featuring:
- Pulse effects
- Rotating orbital rings
- Floating binary particles
- "X" Badge center

## 2. Separated Headers
- **Logged Out**: Uses `SiteHeader` with links to Technology, Privacy, and Guide.
- **Logged In**: Uses `AppHeader` which is cleaner and focused on the tool, removing marketing links.

## 3. New Marketing Content
We added two major sections to the homepage:
- **Two Modes of Operation**: Clearly distinguishing between "Quick Encrypt" (Pixel Packing) and "Steganography" (LSB).
- **Blockchain Recovery Layer**: Explaining how the smart contract backup works.

## 4. In-App Guide
Added a "How to Use" toggle inside the secure app view that reveals a quick 3-step guide for new users.

## Verification
- **Log out** to see the new Hero Animation and Feature sections.
- **Log in** to see the cleaner App Header and try the "How to Use" toggle.
