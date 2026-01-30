# Phase 3 Walkthrough: Advanced Steganography & Performance

We have successfully upgraded PNGX with "Spy Tech" capabilities, enabling true Steganography (hiding data inside real images) and optimizing performance for large files.

## 1. Advanced Steganography Engine (LSB)

We implemented a **Least Significant Bit (LSB)** encoding engine. Unlike the previous version which created "static noise" images, this new engine takes an existing "Cover Image" (like a photo of your cat) and subtly modifies the invisible bits of each pixel to hide your encrypted data.

### How it works:
1.  **Encryption**: The secret file is encrypted with AES-GCM (just like before).
2.  **Embedding**: The encrypted bits are injected into the *least significant bits* of the Red, Green, and Blue channels of the cover image.
3.  **Result**: The image looks identical to the naked eye but contains the secret payload.

**Core Code:** `lib/steganography/lsb.ts`

## 2. High-Performance Web Workers

To ensure the UI never freezes, even when processing 50MB+ files, we moved all image processing to a **Web Worker**.

-   **Background Processing**: Encoding runs on a separate thread.
-   **OffscreenCanvas**: We manipulate pixels without blocking the DOM.
-   **Zero-Copy Transfers**: We use `Transferable` objects to move data between threads instantly, avoiding memory duplication.

**Worker Code:** `lib/workers/steg.worker.ts`

## 3. UI Upgrades

The `SecureProcessor` has been updated to support the new "Steganography Mode".

![New UI Mockup](steg_ui_mockup_1769027023003.png)

### Features:
-   **Cover Image Dropzone**: You can now upload a "Vessel" image.
-   **Capacity Meter**: A real-time progress bar shows how much of the cover image's capacity is used by your secret file. It warns you if the file is too big for the image.
-   **Auto-Detection**: The decoder automatically detects if an image uses LSB or the legacy format.

## 4. Verification & Testing

### How to Test:
1.  **Select Secret File**: Drag & drop a file to hide.
2.  **Select Cover Image**: Drag & drop a normal PNG/JPG.
    -   *Observe the "Capacity Used" meter updating.*
3.  **Click "Hide Inside Image"**: Watch the new "Processing" state with the worker progress.
4.  **Download Result**: The result is a PNG that looks like your cover image.
5.  **Decode**: Refresh the page, go to "Decode", upload that PNG, and use your key. It will extract and decrypt the original file.

## 5. Next Steps

-   **Deployment**: Deploy the `PNGXBackup.sol` contract to a testnet (Base Sepolia) to enable the Blockchain Backup feature fully.
-   **PWA**: Add `manifest.json` and service workers to make this installable on mobile.
