# Phase 3: Advanced Steganography & Mobile Excellence (Proposal)

Now that the Core, Cloud, and Blockchain layers are secure, Phase 3 focuses on making the actual "hiding" technology world-class and ensuring the app feels native on all devices.

## 1. Advanced Steganography Engine 🕵️‍♂️
Currently, we likely use a basic encoding method. We can upgrade to professional-grade steganography.
- **LSB (Least Significant Bit) Encoding**: Truly hide data directly inside the *pixels* of the image, making it visually indistinguishable from the original. (Currently, simple appending can be detected by file size analysis).
- **Compression Resistance**: Algorithms that survive basic compression (optional, very hard but cool).
- **Multiple Carrier Support**: Support encoding into `.wav` (Audio) or `.mp4` (Video)?

## 2. Mobile Experience (PWA) 📱
Make PNGX installed on user's homescreens.
- **PWA Manifest**: Installable as an app.
- **Share Target API**: Allow users to "Share" a photo from their phone's gallery *directly* to PNGX to encrypt it.
- **Touch Optimizations**: Swipe gestures for history, better mobile file pickers.

## 3. Large File Support (Chunking) 📦
- **Client-Side Chunking**: Support files >10MB (or >100MB) by splitting them across multiple "carrier" images or using advanced buffering.
- **Progressive Encryption**: Don't freeze the UI for large files (Web Workers).

## 4. Advanced Security 🔥
- **"Self-Destruct" Links**: Links that strictly delete themselves after 1 view (server-sided enforcement).
- **Passwordless Access**: Share via email magic link (send email via Firebase Extension).

---

## Recommended Priority List
1.  **Web Workers & Performance**: Ensure encryption doesn't freeze the UI (Critical for "Premium" feel).
2.  **LSB Encoding**: True "Spy grade" hiding.
3.  **PWA**: "Add to Homescreen" functionality.

**User Decision Required:**
Which direction excites you most? (e.g., "Focus on Mobile", "Focus on Spy Tech/LSB", or "Focus on Performance")
