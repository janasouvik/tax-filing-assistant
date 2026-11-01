import { findSyntheticRecordByPan } from './fixtures/synthetic-pan-dataset';

export type AadhaarLinkStatus = 'LINKED' | 'NOT_LINKED' | 'UNKNOWN';

export interface AadhaarLinkageResult {
  status: AadhaarLinkStatus;
  isLinked: boolean;
  checkedAt: string;
  provider: 'mock' | 'authoritative';
  message: string;
}

/**
 * AadhaarLinkageService
 *
 * Independent statutory service for Section 139AA Income Tax Act compliance.
 * Resolves Aadhaar–PAN linkage strictly from authoritative provider records.
 * Machine learning models must NEVER infer, guess, or fabricate this status.
 */
export class AadhaarLinkageService {
  /**
   * Resolves the independent Aadhaar linkage status for a given PAN.
   *
   * @param pan The 10-character PAN string.
   * @param isPanVerified Whether identity verification for this PAN succeeded.
   *                      Per specification: If PAN verification failed, Aadhaar linkage
   *                      must not be returned as confirmed; returns UNKNOWN.
   */
  public static async getStatus(pan: string, isPanVerified: boolean): Promise<AadhaarLinkageResult> {
    const checkedAt = new Date().toISOString();

    // If PAN verification failed, linkage cannot be confirmed per specification
    if (!isPanVerified) {
      return {
        status: 'UNKNOWN',
        isLinked: false,
        checkedAt,
        provider: 'mock',
        message: 'Aadhaar linkage status not determined for unverified or mismatched PAN comparison.',
      };
    }

    const normPan = pan.toUpperCase().trim();

    // Check 25-person synthetic fixtures
    const record = findSyntheticRecordByPan(normPan);
    if (record) {
      const status = record.aadhaarStatus;
      return {
        status,
        isLinked: status === 'LINKED',
        checkedAt,
        provider: 'mock',
        message: status === 'LINKED'
          ? 'PAN and Aadhaar are officially linked in records.'
          : 'PAN and Aadhaar are not linked in records.',
      };
    }

    // Legacy sandbox support
    if (normPan === 'ABCDE1234A') {
      return {
        status: 'LINKED',
        isLinked: true,
        checkedAt,
        provider: 'mock',
        message: 'PAN and Aadhaar are officially linked in records.',
      };
    }

    return {
      status: 'UNKNOWN',
      isLinked: false,
      checkedAt,
      provider: 'mock',
      message: 'Aadhaar-PAN link status could not be established.',
    };
  }
}

