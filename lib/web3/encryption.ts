/**
 * Simple symmetric encryption using a key derived from a wallet signature.
 * 
 * Flow:
 * 1. User signs "Access PNGX Backup"
 * 2. Signature is used as the key (or hashed to get a key)
 * 3. Text is encrypted with AES-GCM (via Web Crypto API)
 */

export async function deriveKeyFromSignature(signature: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(signature),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('pngx-salt'), // Fixed salt for deterministic key derivation
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptNote(note: string, signature: string): Promise<string> {
    const key = await deriveKeyFromSignature(signature);
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(note)
    );

    // Combine IV and Ciphertext
    const ivArray = Array.from(iv);
    const encryptedArray = Array.from(new Uint8Array(encrypted));
    const combined = [...ivArray, ...encryptedArray];

    // Base64 encode
    return btoa(String.fromCharCode.apply(null, combined));
}

export async function decryptNote(encryptedBase64: string, signature: string): Promise<string> {
    const key = await deriveKeyFromSignature(signature);

    const combined = new Uint8Array(
        atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );

    // Extract IV (first 12 bytes)
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}
