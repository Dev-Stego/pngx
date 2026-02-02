import { describe, it, expect } from 'vitest';
import { buildPayload, parsePayload } from '../payload';
import { STEF_CONSTANTS } from '../constants';

// Helper to create a mock File with arrayBuffer support for jsdom
function createMockFile(content: string, name: string): File {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const blob = new Blob([data], { type: 'text/plain' });
  
  // Create File-like object with arrayBuffer method (jsdom limitation workaround)
  const file = new File([blob], name, { type: 'text/plain' });
  
  // Polyfill arrayBuffer if not available
  if (!file.arrayBuffer) {
    (file as any).arrayBuffer = async () => {
      return new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(blob);
      });
    };
  }
  
  return file;
}

describe('Payload Builder and Parser', () => {
  describe('STEF_CONSTANTS', () => {
    it('should have correct header size', () => {
      expect(STEF_CONSTANTS.HEADER_SIZE).toBe(328);
    });

    it('should have correct signature', () => {
      expect(STEF_CONSTANTS.SIGNATURE).toBe('PX');
    });

    it('should have correct version', () => {
      expect(STEF_CONSTANTS.VERSION).toBe(1);
    });
  });

  describe('buildPayload', () => {
    it('should create payload with correct header', async () => {
      const file = createMockFile('test content', 'test.txt');
      const secretNote = 'my-secret-note';

      const payload = await buildPayload(file, secretNote);

      // Check signature
      expect(String.fromCharCode(payload[0], payload[1])).toBe('PX');
      // Check version
      expect(payload[2]).toBe(1);
      // Check password flag (0 = no password)
      expect(payload[3]).toBe(0);
    });

    it('should set password flag when password provided', async () => {
      const file = createMockFile('test content', 'test.txt');
      const secretNote = 'my-secret-note';
      const password = 'my-password';

      const payload = await buildPayload(file, secretNote, password);

      // Check password flag (1 = has password)
      expect(payload[3]).toBe(1);
    });

    it('should include filename in header', async () => {
      const fileName = 'important-document.pdf';
      const file = createMockFile('content', fileName);
      const secretNote = 'note';

      const payload = await buildPayload(file, secretNote);

      // Filename starts at offset 12
      const nameBytes = payload.slice(12, 12 + fileName.length);
      const extractedName = new TextDecoder().decode(nameBytes);
      expect(extractedName).toBe(fileName);
    });

    it('should throw error for filename too long', async () => {
      const longName = 'a'.repeat(300) + '.txt';
      const file = createMockFile('content', longName);

      await expect(buildPayload(file, 'note')).rejects.toThrow('Filename too long');
    });

    it('should create payload larger than header size', async () => {
      const file = createMockFile('some content here', 'file.txt');
      const payload = await buildPayload(file, 'secret');

      expect(payload.length).toBeGreaterThan(STEF_CONSTANTS.HEADER_SIZE);
    });
  });

  describe('parsePayload', () => {
    it('should throw error for invalid signature', async () => {
      const invalidPayload = new Uint8Array(500);
      invalidPayload[0] = 'X'.charCodeAt(0);
      invalidPayload[1] = 'X'.charCodeAt(0);

      await expect(parsePayload(invalidPayload, 'secret')).rejects.toThrow('Invalid signature');
    });

    it('should throw error for unsupported version', async () => {
      const invalidPayload = new Uint8Array(500);
      invalidPayload[0] = 'P'.charCodeAt(0);
      invalidPayload[1] = 'X'.charCodeAt(0);
      invalidPayload[2] = 99; // Invalid version

      await expect(parsePayload(invalidPayload, 'secret')).rejects.toThrow('Unsupported version');
    });
  });

  describe('buildPayload and parsePayload round-trip', () => {
    // Skip: requires full browser File API (run as E2E test instead)
    it.skip('should encrypt and decrypt file correctly', async () => {
      const originalContent = 'This is the secret file content!';
      const fileName = 'secret-doc.txt';
      const file = createMockFile(originalContent, fileName);
      const secretNote = 'forest-crystal-dawn-1234';

      // Build payload
      const payload = await buildPayload(file, secretNote);

      // Parse payload
      const recoveredFile = await parsePayload(payload, secretNote);

      expect(recoveredFile.name).toBe(fileName);
      // Use arrayBuffer + TextDecoder for jsdom compatibility
      const buffer = await recoveredFile.arrayBuffer();
      const recoveredContent = new TextDecoder().decode(buffer);
      expect(recoveredContent).toBe(originalContent);
    });

    // Skip: requires full browser File API (run as E2E test instead)
    it.skip('should work with password', async () => {
      const originalContent = 'Password protected content';
      const fileName = 'protected.txt';
      const file = createMockFile(originalContent, fileName);
      const secretNote = 'note-123';
      const password = 'extra-password';

      const payload = await buildPayload(file, secretNote, password);
      const recoveredFile = await parsePayload(payload, secretNote, password);

      const buffer = await recoveredFile.arrayBuffer();
      const recoveredContent = new TextDecoder().decode(buffer);
      expect(recoveredContent).toBe(originalContent);
    });

    it('should fail with wrong secret note', async () => {
      const file = createMockFile('content', 'file.txt');
      const payload = await buildPayload(file, 'correct-note');

      await expect(parsePayload(payload, 'wrong-note'))
        .rejects.toThrow('Decryption Checksum Failed');
    });

    it('should fail with wrong password', async () => {
      const file = createMockFile('content', 'file.txt');
      const payload = await buildPayload(file, 'note', 'correct-password');

      await expect(parsePayload(payload, 'note', 'wrong-password'))
        .rejects.toThrow('Decryption Checksum Failed');
    });

    // Skip: requires full browser File API (run as E2E test instead)
    it.skip('should handle binary file content', async () => {
      // Create binary data (smaller to avoid jsdom issues)
      const binaryData = new Uint8Array(64);
      for (let i = 0; i < 64; i++) binaryData[i] = i;
      
      // Use createMockFile helper with polyfill
      const blob = new Blob([binaryData], { type: 'application/octet-stream' });
      const file = new File([blob], 'binary.bin', { type: 'application/octet-stream' });
      
      // Polyfill arrayBuffer
      if (!file.arrayBuffer) {
        (file as any).arrayBuffer = async () => {
          return new Promise<ArrayBuffer>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.readAsArrayBuffer(blob);
          });
        };
      }
      
      const secretNote = 'binary-secret';

      const payload = await buildPayload(file, secretNote);
      const recoveredFile = await parsePayload(payload, secretNote);

      const recoveredBuffer = await recoveredFile.arrayBuffer();
      const recoveredData = new Uint8Array(recoveredBuffer);
      
      expect(recoveredData.length).toBe(binaryData.length);
      expect(recoveredData[0]).toBe(0);
      expect(recoveredData[63]).toBe(63);
    });

    it('should preserve filename with special characters', async () => {
      const fileName = 'file (1) - copy [2023].txt';
      const file = createMockFile('content', fileName);
      const secretNote = 'note';

      const payload = await buildPayload(file, secretNote);
      const recoveredFile = await parsePayload(payload, secretNote);

      expect(recoveredFile.name).toBe(fileName);
    });
  });
});
