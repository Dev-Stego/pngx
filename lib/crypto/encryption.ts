export const CRYPTO_CONFIG = {
    PBKDF2_ITERATIONS: 100000,
    SALT_LENGTH: 16,
    IV_LENGTH: 12,
    HASH_ALGO: 'SHA-256',
    ENCRYPTION_ALGO: 'AES-GCM',
    KEY_LENGTH: 256,
};

/**
 * Generates a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH));
}

/**
 * Generates a random IV (Initialization Vector) for AES-GCM
 */
export function generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.IV_LENGTH));
}

/**
 * Computes SHA-256 hash of a file or data
 */
export async function computeFileHash(data: BufferSource): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(CRYPTO_CONFIG.HASH_ALGO, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives an encryption key from a password/note using PBKDF2
 */
export async function deriveKey(
    secret: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
            hash: CRYPTO_CONFIG.HASH_ALGO,
        },
        keyMaterial,
        { name: CRYPTO_CONFIG.ENCRYPTION_ALGO, length: CRYPTO_CONFIG.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts data using AES-256-GCM
 * Returns: { encryptedData, iv, salt }
 */
export async function encryptData(
    data: BufferSource,
    secret: string
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array; salt: Uint8Array }> {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(secret, salt);

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: CRYPTO_CONFIG.ENCRYPTION_ALGO,
            iv: iv as any,
        },
        key,
        data
    );

    return { encryptedData, iv, salt };
}

/**
 * Decrypts data using AES-256-GCM
 */
export async function decryptData(
    encryptedData: BufferSource,
    secret: string,
    salt: Uint8Array,
    iv: Uint8Array
): Promise<ArrayBuffer> {
    const key = await deriveKey(secret, salt);

    try {
        return await crypto.subtle.decrypt(
            {
                name: CRYPTO_CONFIG.ENCRYPTION_ALGO,
                iv: iv as any,
            },
            key,
            encryptedData
        );
    } catch (error) {
        throw new Error('Decryption failed. Incorrect note or password.');
    }
}
