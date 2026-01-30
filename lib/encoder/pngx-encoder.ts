import { encryptData, computeFileHash } from '@/lib/crypto/encryption';

const HEADER_SIZE = 328;
const SIGNATURE = 'PX';
const VERSION = 1;

export interface EncodingOptions {
    file: File;
    secretNote: string;
    password?: string;
}

export interface EncodingResult {
    imageUrl: string;
    width: number;
    height: number;
    encryptedSize: number;
}

/**
 * Encodes a file into a PNGX image
 */
export async function encodeFileToImage({
    file,
    secretNote,
    password = '',
}: EncodingOptions): Promise<EncodingResult> {
    // 1. Prepare secret (Note + Password)
    const combinedSecret = `${secretNote}${password}`;

    // 2. Read file
    const fileBuffer = await file.arrayBuffer();
    const fileSize = fileBuffer.byteLength;
    const fileName = file.name;

    // 3. Compute integrity hash (SHA-256 of ORIGINAL content)
    const contentHash = await computeFileHash(fileBuffer);

    // 4. Encrypt content
    const { encryptedData, iv, salt } = await encryptData(fileBuffer, combinedSecret);
    const encryptedBytes = new Uint8Array(encryptedData);

    // 5. Construct Header
    const header = new Uint8Array(HEADER_SIZE);
    const view = new DataView(header.buffer);

    // Offset 0: Signature "PX"
    header[0] = SIGNATURE.charCodeAt(0);
    header[1] = SIGNATURE.charCodeAt(1);

    // Offset 2: Version
    header[2] = VERSION;

    // Offset 3: Flags (Bit 0: Password protected)
    header[3] = password ? 1 : 0;

    // Offset 4: Original File Size (BigInt64)
    view.setBigUint64(4, BigInt(fileSize), true); // Little endian

    // Offset 12: Filename (256 bytes, UTF-8, null padded)
    const nameBytes = new TextEncoder().encode(fileName);
    if (nameBytes.length > 256) {
        throw new Error('Filename too long (max 256 bytes)');
    }
    header.set(nameBytes, 12);

    // Offset 268: Salt (16 bytes)
    header.set(salt, 268);

    // Offset 284: IV (12 bytes)
    header.set(iv, 284);

    // Offset 296: Content Hash (32 bytes)
    // Convert hex string hash back to bytes
    for (let i = 0; i < 32; i++) {
        header[296 + i] = parseInt(contentHash.substr(i * 2, 2), 16);
    }

    // 6. Concatenate Header + Encrypted Data
    const totalSize = HEADER_SIZE + encryptedBytes.length;
    const finalData = new Uint8Array(totalSize);
    finalData.set(header, 0);
    finalData.set(encryptedBytes, HEADER_SIZE);

    // 7. Calculate Image Dimensions (Square)
    // Each pixel holds 3 bytes (RGB) - Alpha is reserved for opacity (255)
    // size = ceil(sqrt(totalBytes / 3))
    const numPixels = Math.ceil(totalSize / 3);
    const dimension = Math.ceil(Math.sqrt(numPixels));
    const width = dimension;
    const height = dimension;

    // 8. Draw to Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error('Could not get canvas context');

    // Create ImageData
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data; // Uint8ClampedArray

    // Fill pixel data
    let inputIndex = 0;
    // Iterate through pixels (4 bytes per pixel in ImageData)
    for (let i = 0; i < data.length; i += 4) {
        // R
        if (inputIndex < totalSize) {
            data[i] = finalData[inputIndex++];
        }
        // G
        if (inputIndex < totalSize) {
            data[i + 1] = finalData[inputIndex++];
        }
        // B
        if (inputIndex < totalSize) {
            data[i + 2] = finalData[inputIndex++];
        }
        // A (Always 255 to prevent transparency issues/browser optimization)
        data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    // 9. Export to Blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas to Blob failed'));
            const url = URL.createObjectURL(blob);
            resolve({
                imageUrl: url,
                width,
                height,
                encryptedSize: totalSize,
            });
        }, 'image/png');
    });
}
