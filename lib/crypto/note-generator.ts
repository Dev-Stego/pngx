/**
 * Security Note Generator
 * Generates secure, memorable notes for file encryption
 */

// Word list for generating memorable phrases (subset of BIP39)
const WORD_LIST = [
    'apple', 'arrow', 'beach', 'bird', 'blue', 'book', 'bread', 'bridge',
    'calm', 'castle', 'cherry', 'cloud', 'coral', 'crystal', 'dawn', 'dream',
    'eagle', 'earth', 'echo', 'ember', 'fern', 'fire', 'flame', 'flash',
    'forest', 'frost', 'garden', 'gem', 'ghost', 'glacier', 'gold', 'grape',
    'harbor', 'hawk', 'heart', 'honey', 'horizon', 'ice', 'iron', 'island',
    'jade', 'jazz', 'jewel', 'jungle', 'karma', 'kite', 'lake', 'lemon',
    'light', 'lily', 'lotus', 'lunar', 'maple', 'marble', 'meadow', 'mist',
    'moon', 'moss', 'night', 'noble', 'north', 'nova', 'oak', 'ocean',
    'olive', 'opal', 'orchid', 'palm', 'pearl', 'pine', 'planet', 'prism',
    'pulse', 'quartz', 'rain', 'raven', 'river', 'rock', 'rose', 'ruby',
    'sage', 'sand', 'shadow', 'shell', 'silver', 'sky', 'snow', 'solar',
    'spark', 'spring', 'star', 'steel', 'stone', 'storm', 'stream', 'sun',
    'swift', 'thunder', 'tiger', 'trail', 'tree', 'tulip', 'valley', 'velvet',
    'violet', 'water', 'wave', 'wild', 'wind', 'winter', 'wolf', 'zen'
];

/**
 * Generate a random word from the word list
 */
function getRandomWord(): string {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    return WORD_LIST[randomBytes[0] % WORD_LIST.length];
}

/**
 * Generate a random number of specified digits
 */
function getRandomNumber(digits: number): string {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const max = Math.pow(10, digits);
    const num = randomBytes[0] % max;
    return num.toString().padStart(digits, '0');
}

/**
 * Generate a secure random string
 */
function getRandomString(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map(b => chars[b % chars.length])
        .join('');
}

export type NoteFormat = 'phrase' | 'alphanumeric';

export interface GeneratedNote {
    note: string;
    format: NoteFormat;
    createdAt: Date;
}

/**
 * Generate a secure, memorable security note
 * 
 * Phrase format: "word-word-word-1234" (e.g., "ocean-crystal-dawn-7829")
 * Alphanumeric format: Random 24-character string
 */
export function generateSecurityNote(format: NoteFormat = 'phrase'): GeneratedNote {
    let note: string;

    if (format === 'phrase') {
        // Generate 3 random words + 4 digit number
        const words = [getRandomWord(), getRandomWord(), getRandomWord()];
        const number = getRandomNumber(4);
        note = `${words.join('-')}-${number}`;
    } else {
        // Generate 24-character alphanumeric string
        note = getRandomString(24);
    }

    return {
        note,
        format,
        createdAt: new Date(),
    };
}

/**
 * Create a downloadable text file with the security note
 */
export function createNoteFile(
    note: string,
    fileName: string,
    additionalInfo?: {
        fileSize?: number;
        dimensions?: string;
        createdAt?: Date;
    }
): Blob {
    const timestamp = (additionalInfo?.createdAt || new Date()).toISOString();

    const content = `
=====================================
       PNGX SECURITY NOTE
=====================================

⚠️  IMPORTANT: Keep this file safe!
    You need this note to decrypt your file.
    There is NO way to recover it if lost.

-------------------------------------
SECURITY NOTE:
${note}
-------------------------------------

FILE DETAILS:
- Original File: ${fileName}
${additionalInfo?.fileSize ? `- Original Size: ${formatBytes(additionalInfo.fileSize)}` : ''}
${additionalInfo?.dimensions ? `- PNG Dimensions: ${additionalInfo.dimensions}` : ''}
- Created: ${timestamp}

-------------------------------------

HOW TO DECRYPT:
1. Go to PNGX and select "Decode (Recover)"
2. Upload the encoded PNG file
3. Enter the security note shown above
4. Your original file will be recovered

=====================================
         pngx.app
=====================================
`.trim();

    return new Blob([content], { type: 'text/plain' });
}

/**
 * Download a blob as a file
 */
export function downloadNoteFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch {
            return false;
        }
    }
}
