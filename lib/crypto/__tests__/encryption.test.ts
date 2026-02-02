import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  generateIV,
  computeFileHash,
  deriveKey,
  encryptData,
  decryptData,
  CRYPTO_CONFIG,
} from '../encryption';

describe('encryption utilities', () => {
  describe('generateSalt', () => {
    it('should generate a 16-byte salt', () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(CRYPTO_CONFIG.SALT_LENGTH);
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('generateIV', () => {
    it('should generate a 12-byte IV', () => {
      const iv = generateIV();
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.length).toBe(CRYPTO_CONFIG.IV_LENGTH);
    });

    it('should generate unique IVs', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();
      expect(iv1).not.toEqual(iv2);
    });
  });

  describe('computeFileHash', () => {
    it('should compute SHA-256 hash as hex string', async () => {
      const data = new TextEncoder().encode('test data');
      const hash = await computeFileHash(data);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 = 32 bytes = 64 hex chars
    });

    it('should produce consistent hashes for same input', async () => {
      const data = new TextEncoder().encode('consistent input');
      const hash1 = await computeFileHash(data);
      const hash2 = await computeFileHash(data);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', async () => {
      const data1 = new TextEncoder().encode('input 1');
      const data2 = new TextEncoder().encode('input 2');
      const hash1 = await computeFileHash(data1);
      const hash2 = await computeFileHash(data2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('deriveKey', () => {
    it('should derive a CryptoKey from secret and salt', async () => {
      const secret = 'my-secret-password';
      const salt = generateSalt();
      const key = await deriveKey(secret, salt);
      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
    });
  });

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalText = 'Hello, World!';
      const originalData = new TextEncoder().encode(originalText);
      const secret = 'my-secret-note';

      const { encryptedData, iv, salt } = await encryptData(originalData, secret);
      expect(encryptedData).toBeDefined();
      expect(encryptedData.byteLength).toBeGreaterThan(originalData.length);

      const decrypted = await decryptData(encryptedData, secret, salt, iv);
      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(originalText);
    });

    it('should fail decryption with wrong secret', async () => {
      const originalData = new TextEncoder().encode('Secret message');

      const { encryptedData, iv, salt } = await encryptData(originalData, 'correct-secret');

      await expect(decryptData(encryptedData, 'wrong-secret', salt, iv))
        .rejects.toThrow('Decryption failed');
    });

    it('should handle empty data', async () => {
      const emptyData = new Uint8Array(0);
      const secret = 'secret';

      const { encryptedData, iv, salt } = await encryptData(emptyData, secret);
      const decrypted = await decryptData(encryptedData, secret, salt, iv);
      expect(new Uint8Array(decrypted).length).toBe(0);
    });

    it('should handle large data', async () => {
      // Note: crypto.getRandomValues has 65KB limit in Node, so fill in chunks
      const largeData = new Uint8Array(1024 * 50); // 50KB (under 65KB limit)
      for (let i = 0; i < largeData.length; i += 65536) {
        const chunk = largeData.subarray(i, Math.min(i + 65536, largeData.length));
        crypto.getRandomValues(chunk);
      }
      const secret = 'secret';

      const { encryptedData, iv, salt } = await encryptData(largeData, secret);
      const decrypted = await decryptData(encryptedData, secret, salt, iv);
      expect(new Uint8Array(decrypted)).toEqual(largeData);
    });
  });
});
