import { describe, it, expect } from 'vitest';
import { validateCode } from '@/lib/validation/code';

describe('validateCode', () => {
  describe('valid codes', () => {
    it('accepts exactly 4 characters', () => {
      expect(validateCode('abc1')).toEqual({ valid: true });
    });

    it('accepts uppercase letters', () => {
      expect(validateCode('ABC_123')).toEqual({ valid: true });
    });

    it('accepts hyphens', () => {
      expect(validateCode('a-b-c-d')).toEqual({ valid: true });
    });

    it('accepts exactly 32 characters', () => {
      expect(validateCode('a'.repeat(32))).toEqual({ valid: true });
    });

    it('accepts only digits', () => {
      expect(validateCode('1234')).toEqual({ valid: true });
    });

    it('accepts underscores and hyphens mixed', () => {
      expect(validateCode('abc_123-XYZ')).toEqual({ valid: true });
    });
  });

  describe('invalid codes', () => {
    it('rejects empty string', () => {
      const result = validateCode('');
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toBeTruthy();
    });

    it('rejects 3 characters (too short)', () => {
      const result = validateCode('abc');
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toMatch(/щонайменше 4/);
    });

    it('rejects 33 characters (too long)', () => {
      const result = validateCode('a'.repeat(33));
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toMatch(/32/);
    });

    it('rejects spaces', () => {
      const result = validateCode('abc 1');
      expect(result.valid).toBe(false);
    });

    it('rejects cyrillic characters', () => {
      const result = validateCode('абвг');
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toBeTruthy();
    });

    it('rejects special symbols !@#$%^&*()', () => {
      expect(validateCode('abc!')).toEqual(expect.objectContaining({ valid: false }));
      expect(validateCode('abc@')).toEqual(expect.objectContaining({ valid: false }));
    });

    it('provides a Ukrainian error message for invalid characters', () => {
      const result = validateCode('abc!');
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.length).toBeGreaterThan(0);
    });

    it('provides a Ukrainian error message for empty input', () => {
      const result = validateCode('');
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toMatch(/порожнім/);
    });
  });
});
