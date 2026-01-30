import { decryptData, computeFileHash } from '@/lib/crypto/encryption';

const HEADER_SIZE = 328;
const SIGNATURE = 'PX';

export interface DecodingOptions {
    imageFile: File;
    secretNote: string;
    password?: string;
}

export interface DecodingResult {
    file: File;
    decryptedSize: number;
}

/**
 * Decodes a PNGX image back to the original file
 */
export async function decodeImageToFile({
    imageFile,
    secretNote,
    password = '',
}: DecodingOptions): Promise<DecodingResult> {
    // 1. Load Image
    // CRITICAL: Use createImageBitmap with colorSpaceConversion: 'none' to prevent
    // browser color profile transformations that corrupt pixel data.
    const bitmap = await createImageBitmap(imageFile, {
        colorSpaceConversion: 'none',
        premultiplyAlpha: 'none'
    });

    // 2. Read Pixels via Canvas
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close(); // Free memory
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data; // R, G, B, A, R, G, B, A...

    // 3. Extract Linear Bytes (RGB only)
    // We stored data in R, G, B channels. Alpha was used for opacity.
    // We need to extract 3 bytes per pixel.
    const totalPixels = canvas.width * canvas.height;
    const capacity = totalPixels * 3;
    const rawBytes = new Uint8Array(capacity);

    let destIdx = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
        rawBytes[destIdx++] = pixelData[i];     // R
        rawBytes[destIdx++] = pixelData[i + 1]; // G
        rawBytes[destIdx++] = pixelData[i + 2]; // B
        // Skip Alpha (i + 3)
    }

    // Now rawBytes contains the contiguous data stream.

    // Validate Signature
    if (String.fromCharCode(rawBytes[0], rawBytes[1]) !== SIGNATURE) {
        throw new Error('Invalid PNGX file. Signature missing.');
    }

    const version = rawBytes[2];
    if (version !== 1) {
        throw new Error(`Unsupported version: ${version}`);
    }

    // Read File Size (BigInt64 at offset 4)
    const view = new DataView(rawBytes.buffer);
    const fileSize = Number(view.getBigInt64(4, true)); // dangerous for >2GB if we lose precision? 2^53 is huge. OK.

    // Read Filename
    let fileName = '';
    const nameBytes = rawBytes.slice(12, 268);
    const nullIndex = nameBytes.indexOf(0);
    if (nullIndex !== -1) {
        fileName = new TextDecoder().decode(nameBytes.slice(0, nullIndex));
    } else {
        fileName = new TextDecoder().decode(nameBytes);
    }

    // Read Salt (16 bytes at 268)
    const salt = rawBytes.slice(268, 284);

    // Read IV (12 bytes at 284)
    const iv = rawBytes.slice(284, 296);

    // Read Content Hash (32 bytes at 296)
    // Reconstruct hex string
    const storedHashBytes = rawBytes.slice(296, 328);
    const storedHash = Array.from(storedHashBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    // 4. Extract Encrypted Payload
    // Data starts at 328.
    // AES-GCM tag is usually appended or included. 
    // We assume EncryptedSize = OriginalSize + 16 (Tag).
    const estimatedEncryptedSize = fileSize + 16;

    const encryptedData = rawBytes.slice(HEADER_SIZE, HEADER_SIZE + estimatedEncryptedSize);

    // 5. Decrypt
    const combinedSecret = `${secretNote}${password}`;

    let decryptedBuffer: ArrayBuffer;
    try {
        decryptedBuffer = await decryptData(encryptedData, combinedSecret, salt, iv);
    } catch (e) {
        console.error('Decryption failed:', e);
        throw e;
    }

    // 6. Verify Integrity
    const calculatedHash = await computeFileHash(decryptedBuffer);
    if (calculatedHash !== storedHash) {
        throw new Error('Integrity check failed. File content may be corrupted.');
    }

    // 7. Reconstruct File
    const file = new File([decryptedBuffer], fileName, {
        type: 'application/octet-stream', // Or try to detect mime type?
    });

    return {
        file,
        decryptedSize: fileSize,
    };
}
