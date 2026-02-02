import { describe, it, expect } from 'vitest';
import {
  stringToBinary,
  binaryToString,
  encodeLSB,
  decodeLSB,
} from '../lsb';

// Helper to create a mock ImageData
function createMockImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  // Fill with random values to simulate a real image
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 256);
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData;
}

describe('LSB Steganography', () => {
  describe('stringToBinary', () => {
    it('should convert string to Uint8Array', () => {
      const result = stringToBinary('hello');
      expect(result.length).toBe(5);
      expect(result[0]).toBe(104); // 'h'
    });

    it('should handle empty string', () => {
      const result = stringToBinary('');
      expect(result.length).toBe(0);
    });

    it('should handle unicode characters', () => {
      const result = stringToBinary('你好');
      expect(result.length).toBe(6); // 3 bytes per Chinese character in UTF-8
    });
  });

  describe('binaryToString', () => {
    it('should convert Uint8Array back to string', () => {
      const original = 'hello world';
      const binary = stringToBinary(original);
      const result = binaryToString(binary);
      expect(result).toBe(original);
    });

    it('should handle empty array', () => {
      const result = binaryToString(new Uint8Array(0));
      expect(result).toBe('');
    });
  });

  describe('encodeLSB and decodeLSB', () => {
    it('should encode and decode simple data', () => {
      const imageData = createMockImageData(100, 100);
      const secretData = new Uint8Array([1, 2, 3, 4, 5]);

      const encoded = encodeLSB(imageData, secretData);
      const decoded = decodeLSB(encoded);

      expect(decoded).toEqual(secretData);
    });

    it('should encode and decode text message', () => {
      const imageData = createMockImageData(100, 100);
      const message = 'Secret message!';
      const secretData = stringToBinary(message);

      const encoded = encodeLSB(imageData, secretData);
      const decoded = decodeLSB(encoded);
      const decodedMessage = binaryToString(decoded);

      expect(decodedMessage).toBe(message);
    });

    it('should handle empty data', () => {
      const imageData = createMockImageData(50, 50);
      const secretData = new Uint8Array(0);

      const encoded = encodeLSB(imageData, secretData);
      const decoded = decodeLSB(encoded);

      expect(decoded.length).toBe(0);
    });

    it('should throw error if image is too small', () => {
      const imageData = createMockImageData(2, 2); // Only 12 bits capacity
      const secretData = new Uint8Array(100); // Way too large

      expect(() => encodeLSB(imageData, secretData)).toThrow('Image too small');
    });

    it('should use maximum capacity correctly', () => {
      const imageData = createMockImageData(10, 10); // 100 pixels = 300 bits
      // 300 bits - 32 (header) = 268 bits = 33 bytes max
      const secretData = new Uint8Array(33);
      for (let i = 0; i < 33; i++) secretData[i] = i;

      const encoded = encodeLSB(imageData, secretData);
      const decoded = decodeLSB(encoded);

      expect(decoded).toEqual(secretData);
    });

    it('should preserve image dimensions', () => {
      const imageData = createMockImageData(200, 150);
      const secretData = stringToBinary('test');

      const encoded = encodeLSB(imageData, secretData);

      expect(encoded.width).toBe(200);
      expect(encoded.height).toBe(150);
    });

    it('should handle binary data with all byte values', () => {
      const imageData = createMockImageData(100, 100);
      // Create data with all possible byte values 0-255
      const secretData = new Uint8Array(256);
      for (let i = 0; i < 256; i++) secretData[i] = i;

      const encoded = encodeLSB(imageData, secretData);
      const decoded = decodeLSB(encoded);

      expect(decoded).toEqual(secretData);
    });

    it('should only modify LSB of RGB channels', () => {
      const imageData = createMockImageData(100, 100);
      const originalAlphaValues: number[] = [];
      
      // Store original alpha values
      for (let i = 3; i < imageData.data.length; i += 4) {
        originalAlphaValues.push(imageData.data[i]);
      }

      const secretData = stringToBinary('test data');
      const encoded = encodeLSB(imageData, secretData);

      // Verify alpha channel is unchanged
      let alphaIndex = 0;
      for (let i = 3; i < encoded.data.length; i += 4) {
        expect(encoded.data[i]).toBe(originalAlphaValues[alphaIndex]);
        alphaIndex++;
      }
    });
  });

  describe('decodeLSB error handling', () => {
    it('should throw error for invalid header (corrupted length)', () => {
      const imageData = createMockImageData(10, 10);
      // Set all LSBs to 1, creating a huge invalid length
      for (let i = 0; i < 32; i++) {
        const pixelIndex = Math.floor(i / 3);
        const channelOffset = i % 3;
        const dataIndex = (pixelIndex * 4) + channelOffset;
        imageData.data[dataIndex] |= 1;
      }

      expect(() => decodeLSB(imageData)).toThrow('Invalid LSB header');
    });
  });
});
