import { MockPanProvider } from './providers/mock-pan.provider';
import { AadhaarLinkageService, AadhaarLinkStatus } from './aadhaar-linkage.service';
import { isValidPanFormat, maskPan, normalizePan } from './pan.validator';

export type VerificationOutcome =
  | 'PAN_VERIFIED'
  | 'INVALID_PAN'
  | 'NAME_MISMATCH'
  | 'DOB_MISMATCH';

export interface IdentityVerifyInput {
  pan: string;
  name?: string;
  dob?: string;
}

export interface FieldComparisonDetail {
  submitted: string;
  registered: string | null;
  matched: boolean;
}

export interface IdentityVerificationResult {
  verificationStatus: VerificationOutcome;
  panStatus: 'VALID' | 'INVALID' | 'NOT_FOUND';
  nameMatch: boolean;
  dobMatch: boolean;
  aadhaarLinkStatus: AadhaarLinkStatus;
  registeredName: string | null;
  registeredDob: string | null;
  submittedName: string;
  submittedDob: string;
  maskedPan: string;
  message: string;
  provider: 'mock' | 'setu';
  testRecordId: string | null;
  verificationTimestamp: string;
  isMockResponse: boolean;
  details: {
    panFound: boolean;
    nameComparison: FieldComparisonDetail;
    dobComparison: FieldComparisonDetail;
  };
}

/**
 * Normalizes calendar dates into canonical YYYY-MM-DD string.
 * Supports DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, and YYYY/MM/DD.
 */
export function normalizeDate(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();
  if (!s) return null;

  // Handle YYYY-MM-DD or YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10);
    const d = parseInt(ymd[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10);
    const y = parseInt(dmy[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Fallback to JS Date parsing
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = parsed.getMonth() + 1;
    const d = parsed.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return null;
}

/**
 * Normalizes applicant name: trims, collapses multi-spaces, lowercases.
 */
export function normalizeName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * IdentityMatchingService
 *
 * Performs deterministic field-by-field verification:
 * 1. Verifies PAN existence and format.
 * 2. Compares submitted full name with registered authoritative record name.
 * 3. Compares submitted date of birth with registered authoritative date of birth.
 * 4. Resolves independent Aadhaar-PAN linkage (confirmed only when PAN is verified).
 */
export class IdentityMatchingService {
  private static mockProvider = new MockPanProvider();

  public static async verifyIdentity(input: IdentityVerifyInput): Promise<IdentityVerificationResult> {
    const rawPan = input.pan || '';
    const submittedName = (input.name || '').trim();
    const submittedDob = (input.dob || '').trim();
    const pan = normalizePan(rawPan);
    const verificationTimestamp = new Date().toISOString();

    // 1. Validate PAN format
    if (!pan || !isValidPanFormat(pan)) {
      return {
        verificationStatus: 'INVALID_PAN',
        panStatus: 'INVALID',
        nameMatch: false,
        dobMatch: false,
        aadhaarLinkStatus: 'UNKNOWN',
        registeredName: null,
        registeredDob: null,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan || 'UNKNOWN'),
        message: 'Invalid PAN format. PAN must match [A-Z]{5}[0-9]{4}[A-Z].',
        provider: 'mock',
        testRecordId: null,
        verificationTimestamp,
        isMockResponse: true,
        details: {
          panFound: false,
          nameComparison: { submitted: submittedName, registered: null, matched: false },
          dobComparison: { submitted: submittedDob, registered: null, matched: false },
        },
      };
    }

    // 2. Authoritative database lookup
    const authRecord = this.mockProvider.lookupAuthoritativeRecord(pan);
    if (!authRecord.found || !authRecord.registeredName) {
      return {
        verificationStatus: 'INVALID_PAN',
        panStatus: 'NOT_FOUND',
        nameMatch: false,
        dobMatch: false,
        aadhaarLinkStatus: 'UNKNOWN',
        registeredName: null,
        registeredDob: null,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        message: 'PAN does not exist in authoritative records.',
        provider: 'mock',
        testRecordId: authRecord.testRecordId,
        verificationTimestamp,
        isMockResponse: true,
        details: {
          panFound: false,
          nameComparison: { submitted: submittedName, registered: null, matched: false },
          dobComparison: { submitted: submittedDob, registered: null, matched: false },
        },
      };
    }

    // 3. Name comparison
    const isNameMatch = normalizeName(submittedName) === normalizeName(authRecord.registeredName);

    // 4. DOB comparison
    const normSubmittedDob = normalizeDate(submittedDob);
    const normRegisteredDob = normalizeDate(authRecord.registeredDob);
    const isDobMatch = Boolean(
      normSubmittedDob &&
      normRegisteredDob &&
      normSubmittedDob === normRegisteredDob
    );

    // 5. Evaluate exact mismatch reasons
    if (!isNameMatch) {
      return {
        verificationStatus: 'NAME_MISMATCH',
        panStatus: 'VALID',
        nameMatch: false,
        dobMatch: isDobMatch,
        aadhaarLinkStatus: 'UNKNOWN', // Not determined on failed verification
        registeredName: authRecord.registeredName,
        registeredDob: authRecord.registeredDobDisplay || authRecord.registeredDob,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        message: `Name Mismatch: Submitted name "${submittedName}" differs from registered name "${authRecord.registeredName}".`,
        provider: 'mock',
        testRecordId: authRecord.testRecordId,
        verificationTimestamp,
        isMockResponse: true,
        details: {
          panFound: true,
          nameComparison: {
            submitted: submittedName,
            registered: authRecord.registeredName,
            matched: false,
          },
          dobComparison: {
            submitted: submittedDob,
            registered: authRecord.registeredDobDisplay || authRecord.registeredDob,
            matched: isDobMatch,
          },
        },
      };
    }

    if (!isDobMatch) {
      return {
        verificationStatus: 'DOB_MISMATCH',
        panStatus: 'VALID',
        nameMatch: true,
        dobMatch: false,
        aadhaarLinkStatus: 'UNKNOWN', // Not determined on failed verification
        registeredName: authRecord.registeredName,
        registeredDob: authRecord.registeredDobDisplay || authRecord.registeredDob,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        message: `DOB Mismatch: Submitted date of birth "${submittedDob}" differs from registered date of birth in authoritative records.`,
        provider: 'mock',
        testRecordId: authRecord.testRecordId,
        verificationTimestamp,
        isMockResponse: true,
        details: {
          panFound: true,
          nameComparison: {
            submitted: submittedName,
            registered: authRecord.registeredName,
            matched: true,
          },
          dobComparison: {
            submitted: submittedDob,
            registered: authRecord.registeredDobDisplay || authRecord.registeredDob,
            matched: false,
          },
        },
      };
    }

    // 6. Both match -> PAN_VERIFIED!
    const linkage = await AadhaarLinkageService.getStatus(pan, true);

    return {
      verificationStatus: 'PAN_VERIFIED',
      panStatus: 'VALID',
      nameMatch: true,
      dobMatch: true,
      aadhaarLinkStatus: linkage.status,
      registeredName: authRecord.registeredName,
      registeredDob: authRecord.registeredDobDisplay || authRecord.registeredDob,
      submittedName,
      submittedDob,
      maskedPan: maskPan(pan),
      message: 'PAN is verified and active. Identity details match authoritative records.',
      provider: 'mock',
      testRecordId: authRecord.testRecordId,
      verificationTimestamp,
      isMockResponse: true,
      details: {
        panFound: true,
        nameComparison: {
          submitted: submittedName,
          registered: authRecord.registeredName,
          matched: true,
        },
        dobComparison: {
          submitted: submittedDob,
          registered: authRecord.registeredDobDisplay || authRecord.registeredDob,
          matched: true,
        },
      },
    };
  }
}

