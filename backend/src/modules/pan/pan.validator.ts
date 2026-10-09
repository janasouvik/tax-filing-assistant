/**
 * PAN Validator
 *
 * Validates PAN format using the government-defined regex.
 * FORMAT_VALID ≠ PAN_VERIFIED — format checks only that the structure is correct.
 */

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/**
 * Normalizes a PAN: trims whitespace and uppercases.
 */
export function normalizePan(pan: string): string {
  return pan.trim().toUpperCase();
}

/**
 * Validates the normalized PAN format.
 * Returns true only for ABCDE1234F shape (5 letters, 4 digits, 1 letter).
 */
export function isValidPanFormat(pan: string): boolean {
  return PAN_REGEX.test(pan);
}

/**
 * Masks a PAN for safe display / logging: ABCDE1234F → ABCDE****F
 * Never exposes the digit sequence.
 */
export function maskPan(pan: string): string {
  if (!pan || pan.length !== 10) return pan;
  return pan.slice(0, 5) + '****' + pan.slice(-1);
}
