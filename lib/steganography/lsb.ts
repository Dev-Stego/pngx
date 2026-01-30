export function stringToBinary(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

export function binaryToString(bytes: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

/**
 * Encodes binary data into the LSB of image channels (R, G, B).
 * Structure: [Length Header (32 bits)] + [Data Bits]
 */
export function encodeLSB(imageData: ImageData, secretData: Uint8Array): ImageData {
    const dataLength = secretData.length;

    // 32-bit length header + data bits * 8
    const totalBitsNeeded = 32 + (dataLength * 8);
    // 3 channels (RGB) per pixel are usable. Alpha is risky for some viewers/compressors.
    const totalPixels = imageData.width * imageData.height;
    const capacityBits = totalPixels * 3;

    if (totalBitsNeeded > capacityBits) {
        throw new Error(`Image too small. Needed: ${totalBitsNeeded} bits, Capacity: ${capacityBits} bits.`);
    }

    const pixels = imageData.data;
    let bitIndex = 0;

    // Helper to write a bit
    const writeBit = (bit: number) => {
        // Find position: skip Alpha channels (Every 4th byte is Alpha)
        // Map logical bitIndex to physical array index
        // logical 0 -> 0 (R), logical 1 -> 1 (G), logical 2 -> 2 (B)
        // logical 3 -> 4 (R of next pixel) ...

        let pixelIndex = Math.floor(bitIndex / 3);
        let channelOffset = bitIndex % 3; // 0=R, 1=G, 2=B

        let dataIndex = (pixelIndex * 4) + channelOffset;

        // Clear LSB
        pixels[dataIndex] &= ~1;
        // Set LSB
        pixels[dataIndex] |= bit;

        bitIndex++;
    };

    // 1. Write Length Header (32 bits)
    for (let i = 0; i < 32; i++) {
        const bit = (dataLength >> i) & 1; // Little endian? Or Big? Let's use standard shift.
        // Actually, let's stick to Big Endian (Network Byte Order) usually, but simple shift is fine if consistent.
        // (dataLength >> i) means bit 0 comes first. That's Little Endian-ish in stream.
        writeBit(bit);
    }

    // 2. Write Data
    for (let i = 0; i < dataLength; i++) {
        const byte = secretData[i];
        for (let j = 0; j < 8; j++) {
            const bit = (byte >> j) & 1;
            writeBit(bit);
        }
    }

    return imageData;
}

export function decodeLSB(imageData: ImageData): Uint8Array {
    const pixels = imageData.data;
    let bitIndex = 0;

    const readBit = (): number => {
        let pixelIndex = Math.floor(bitIndex / 3);
        let channelOffset = bitIndex % 3;
        let dataIndex = (pixelIndex * 4) + channelOffset;

        bitIndex++;
        return pixels[dataIndex] & 1;
    };

    // 1. Read Length Header
    let length = 0;
    for (let i = 0; i < 32; i++) {
        const bit = readBit();
        length |= (bit << i);
    }

    // Sanity check length
    const maxCapacity = (imageData.width * imageData.height * 3) - 32;
    if (length * 8 > maxCapacity || length < 0) {
        throw new Error("Invalid LSB header or empty data found.");
    }

    // 2. Read Data
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            const bit = readBit();
            byte |= (bit << j);
        }
        bytes[i] = byte;
    }

    return bytes; // Return Uint8Array directly
}
