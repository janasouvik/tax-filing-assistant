import { describe, it, expect } from 'vitest';
import { normalizePan, isValidPanFormat, maskPan } from './pan.validator';

describe('PAN Validator', () => {
  describe('normalizePan', () => {
    it('trims and uppercases PAN', () => {
      expect(normalizePan(' abcde1234f ')).toBe('ABCDE1234F');
      expect(normalizePan('AbCdE1234F')).toBe('ABCDE1234F');
    });
  });

  describe('isValidPanFormat', () => {
    it('returns true for valid PAN format', () => {
      expect(isValidPanFormat('ABCDE1234F')).toBe(true);
      expect(isValidPanFormat('PPPPP9999P')).toBe(true);
    });

    it('returns false for invalid length', () => {
      expect(isValidPanFormat('ABCDE1234')).toBe(false); // 9 chars
      expect(isValidPanFormat('ABCDE1234F5')).toBe(false); // 11 chars
    });

    it('returns false for invalid character positions', () => {
      expect(isValidPanFormat('1BCDE1234F')).toBe(false); // starts with digit
      expect(isValidPanFormat('ABCD11234F')).toBe(false); // 5th is digit
      expect(isValidPanFormat('ABCDE12345')).toBe(false); // ends with digit
      expect(isValidPanFormat('ABCDE12F4F')).toBe(false); // letter in digits
    });
  });

  describe('maskPan', () => {
    it('masks middle 4 characters', () => {
      expect(maskPan('ABCDE1234F')).toBe('ABCDE****F');
    });

    it('returns as-is if invalid length', () => {
      expect(maskPan('ABCDE')).toBe('ABCDE');
      expect(maskPan('')).toBe('');
    });
  });
});
