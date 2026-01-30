import { encryptData, decryptData, computeFileHash } from '@/lib/crypto/encryption';
import { STEF_CONSTANTS } from './constants';

const { HEADER_SIZE, SIGNATURE, VERSION } = STEF_CONSTANTS;

/**
 * Encrypts a file and prepends the PNGX header.
 * Resulting Uint8Array is ready to be embedded into an image.
 */
export async function buildPayload(file: File, secretNote: string, password = ''): Promise<Uint8Array> {
    const combinedSecret = `${secretNote}${password}`;
    const fileBuffer = await file.arrayBuffer();
    const fileSize = fileBuffer.byteLength;
    const fileName = file.name;

    // Integrity Hash
    const contentHash = await computeFileHash(fileBuffer);

    // Encrypt
    const { encryptedData, iv, salt } = await encryptData(fileBuffer, combinedSecret);
    const encryptedBytes = new Uint8Array(encryptedData);

    // Construct Header
    const header = new Uint8Array(HEADER_SIZE);
    const view = new DataView(header.buffer);

    header[0] = SIGNATURE.charCodeAt(0);
    header[1] = SIGNATURE.charCodeAt(1);
    header[2] = VERSION;
    header[3] = password ? 1 : 0;
    view.setBigUint64(4, BigInt(fileSize), true); // Little Endian

    const nameBytes = new TextEncoder().encode(fileName);
    if (nameBytes.length > 256) throw new Error('Filename too long');
    header.set(nameBytes, 12);

    header.set(salt, 268);
    header.set(iv, 284);

    // Hash string to bytes
    for (let i = 0; i < 32; i++) {
        header[296 + i] = parseInt(contentHash.slice(i * 2, (i * 2) + 2), 16);
    }

    // Combine
    const finalData = new Uint8Array(HEADER_SIZE + encryptedBytes.length);
    finalData.set(header, 0);
    finalData.set(encryptedBytes, HEADER_SIZE);

    return finalData;
}

/**
 * Parses the extracted binary payload, verifies header, and decrypts the file.
 */
export async function parsePayload(rawBytes: Uint8Array, secretNote: string, password = ''): Promise<File> {
    // Validate Signature
    if (String.fromCharCode(rawBytes[0], rawBytes[1]) !== SIGNATURE) {
        throw new Error('Invalid signature.');
    }

    if (rawBytes[2] !== VERSION) {
        throw new Error('Unsupported version.');
    }

    const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
    const originalFileSize = Number(view.getBigInt64(4, true));

    // Filename
    const nameBytes = rawBytes.slice(12, 268);
    const nullIndex = nameBytes.indexOf(0);
    const fileName = new TextDecoder().decode(nullIndex >= 0 ? nameBytes.slice(0, nullIndex) : nameBytes);

    const salt = rawBytes.slice(268, 284);
    const iv = rawBytes.slice(284, 296);

    const storedHashBytes = rawBytes.slice(296, 328);
    const storedHash = Array.from(storedHashBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    // Decrypt Body
    // Encrypted size should be roughly (Original + Tag).
    // AES-GCM tag is 16 bytes? Or variable.
    // We can just take the rest of the buffer from HEADER_SIZE.
    // HOWEVER, LSB decoding might give us trailing garbage bits if we read past the end?
    // Wait, `decodeLSB` in `lsb.ts` specifically reads the "Length Header" (32 bits) and reads EXACTLY that many bytes.
    // So `rawBytes` passed here should be EXACTLY the payload size.

    const encryptedData = rawBytes.slice(HEADER_SIZE);

    const combinedSecret = `${secretNote}${password}`;

    let decryptedBuffer: ArrayBuffer;
    try {
        decryptedBuffer = await decryptData(encryptedData, combinedSecret, salt, iv);
    } catch (e) {
        throw new Error('Decryption Checksum Failed. Wrong password?');
    }

    // Hash Check
    const calcHash = await computeFileHash(decryptedBuffer);
    if (calcHash !== storedHash) {
        throw new Error('Integrity check failed.');
    }

    return new File([decryptedBuffer], fileName, { type: 'application/octet-stream' });
}
