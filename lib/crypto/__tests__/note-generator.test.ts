import { describe, it, expect } from 'vitest';
import {
  generateSecurityNote,
  copyToClipboard,
  createNoteFile,
  downloadNoteFile,
  type GeneratedNote,
  type NoteFormat,
} from '../note-generator';

describe('note-generator utilities', () => {
  describe('generateSecurityNote', () => {
    it('should generate a phrase-style note by default', () => {
      const result = generateSecurityNote();
      expect(result).toBeDefined();
      expect(result.note).toBeDefined();
      expect(result.format).toBe('phrase');
      expect(typeof result.note).toBe('string');
      expect(result.note.length).toBeGreaterThan(0);
    });

    it('should generate an alphanumeric-style note', () => {
      const result = generateSecurityNote('alphanumeric');
      expect(result.format).toBe('alphanumeric');
      expect(result.note).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate phrase notes with hyphens', () => {
      const result = generateSecurityNote('phrase');
      // Format: word-word-word-1234
      expect(result.note).toMatch(/-/);
    });

    it('should generate unique notes on each call', () => {
      const notes = new Set<string>();
      for (let i = 0; i < 50; i++) {
        notes.add(generateSecurityNote().note);
      }
      // All 50 should be unique
      expect(notes.size).toBe(50);
    });

    it('should generate phrase notes with 3 words + number', () => {
      const result = generateSecurityNote('phrase');
      // Format: word-word-word-1234
      const parts = result.note.split('-');
      expect(parts.length).toBe(4);
      expect(parts[3]).toMatch(/^\d{4}$/); // Last part is 4 digits
    });

    it('should generate alphanumeric notes of 24 characters', () => {
      const result = generateSecurityNote('alphanumeric');
      expect(result.note.length).toBe(24);
    });

    it('should include createdAt timestamp', () => {
      const result = generateSecurityNote();
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('createNoteFile', () => {
    it('should create a Blob with note content', () => {
      const blob = createNoteFile('test-note-123', 'test-file.pdf');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
    });

    it('should include the note in the content', async () => {
      const note = 'unique-test-note-456';
      const blob = createNoteFile(note, 'document.pdf');
      // Use FileReader for jsdom compatibility (blob.text() not available)
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });
      expect(text).toContain(note);
      expect(text).toContain('document.pdf');
    });
  });

  describe('copyToClipboard', () => {
    it('should be a function', () => {
      expect(typeof copyToClipboard).toBe('function');
    });
  });

  describe('downloadNoteFile', () => {
    it('should be a function', () => {
      expect(typeof downloadNoteFile).toBe('function');
    });
  });
});
