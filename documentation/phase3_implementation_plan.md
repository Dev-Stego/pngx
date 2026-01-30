# Phase 3: Advanced Steganography & Performance

## Goal
Upgrade the encryption engine to use **Least Significant Bit (LSB)** steganography for true visual covertness, and move all processing to **Web Workers** to keep the UI buttery smooth.

## 1. Web Worker Architecture 🏗️
Processing images (getting pixel data, manipulating bits) is CPU intensive. We will move this logic out of the React components.

- **Actions**:
    - Create `workers/steg.worker.ts`.
    - Implement message passing interface (EncodeRequest -> Progress -> EncodeSuccess).
    - Refactor `SecureProcessor` to instantiate and communicate with the worker.

## 2. LSB Steganography Algorithm 🕵️‍♂️
Current method (likely): Appending data or simple overlay.
New method: **LSB (Least Significant Bit)**.

### Algorithm Overview
1.  **Input**: Cover Image (PNG), Secret Data (Encrypted Blob).
2.  **Process**:
    - Convert Secret Data to binary stream (0s and 1s).
    - Iterate through Cover Image pixels (R, G, B, A).
    - Replace the last bit of each channel with a bit from the secret data.
    - Capacity: Roughly 3 bits per pixel (ignoring Alpha often preserves transparency better, or use all 4).
    - *Constraint*: The Cover Image must be large enough to hold the data! (Width * Height * 3 / 8 > File Size).

### Security Header
We need to embed a "header" length so the decoder knows how much to read.
- First 32 pixels (or specific sequence) = Content Length (uint32).

## 3. Implementation Steps
1.  **[ ] Create Worker Infrastructure**: Setup `comlink` or raw `postMessage` handlers.
2.  **[ ] Implement LSB Encoder**: Write pure TS function to mix binary data into ImageData.
3.  **[ ] Implement LSB Decoder**: Write pure TS function to extract binary data from ImageData.
4.  **[ ] Update UI**: Add "Capacity Meter" to show if the selected image is big enough for the file.

## Verification
- **Visual Test**: The output image should look *identical* to the input.
- **Bitwise Test**: Extracted bits must match exactly.
- **Performance**: UI must not freeze during encoding.
