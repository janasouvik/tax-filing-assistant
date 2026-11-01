import { MockPanProvider } from './providers/mock-pan.provider';
import { SetuPanProvider } from './providers/setu-pan.provider';
import type { PanProvider } from './providers/pan.provider';
import { AadhaarLinkageService, AadhaarLinkStatus } from './aadhaar-linkage.service';
import { isValidPanFormat, maskPan, normalizePan } from './pan.validator';
import { isSyntheticMockPan } from './fixtures/synthetic-pan-dataset';
import { AppError } from '../../utils/response';

export type VerificationOutcome =
  | 'PAN_VERIFIED'
  | 'INVALID_PAN'
  | 'INVALID_PAN_FORMAT'
  | 'NAME_MISMATCH'
  | 'DOB_MISMATCH'
  | 'UNKNOWN'
  | 'ERROR';

export type PanRecordStatus = 'VALID' | 'NOT_FOUND' | 'INVALID';

export interface PanIdentityVerifyInput {
  pan: string;
  name?: string;
  dob?: string; // YYYY-MM-DD or DD/MM/YYYY
  mobile?: string;
  provider?: 'mock' | 'setu';
  isMockFixture?: boolean;
}

export interface FieldComparisonDetail {
  submitted: string;
  registered: string | null;
  matched: boolean | null;
}

export interface PanIdentityVerificationResult {
  success: boolean;
  verificationStatus: VerificationOutcome;
  panStatus: PanRecordStatus;
  nameMatch: boolean | null;
  dobMatch: boolean | null;
  aadhaarLinkStatus: AadhaarLinkStatus;
  registeredName: string | null;
  registeredDob: string | null;
  submittedName: string;
  submittedDob: string;
  maskedPan: string;
  provider: 'MOCK' | 'SETU';
  message: string;
  testRecordId?: string | null;
  isMockResponse: boolean;
  verifiedAt: string;
  verificationTimestamp?: string;
  details: {
    panFound: boolean;
    formatValid: boolean;
    nameComparison?: FieldComparisonDetail;
    dobComparison?: FieldComparisonDetail;
    providerRawVerification?: string;
    traceId?: string;
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
 * PanIdentityVerificationService
 *
 * Centralized, shared service orchestrating PAN identity verification for BOTH
 * the actual TaxPilot React website and the testpan.html test bench.
 */
export class PanIdentityVerificationService {
  private static mockProvider = new MockPanProvider();

  public static async verifyIdentity(
    input: PanIdentityVerifyInput
  ): Promise<PanIdentityVerificationResult> {
    const rawPan = input.pan || '';
    const submittedName = (input.name || '').trim();
    const submittedDob = (input.dob || '').trim();
    const pan = normalizePan(rawPan);
    const verifiedAt = new Date().toISOString();

    // 1. Syntactic PAN Format Validation (fails before authoritative provider request is made)
    if (!pan || !isValidPanFormat(pan)) {
      const authRecord = this.mockProvider.lookupAuthoritativeRecord(pan);
      return {
        success: false,
        verificationStatus: 'INVALID_PAN_FORMAT',
        panStatus: 'INVALID',
        nameMatch: false,
        dobMatch: false,
        aadhaarLinkStatus: 'UNKNOWN',
        registeredName: null,
        registeredDob: null,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan || 'UNKNOWN'),
        provider: 'MOCK',
        message: 'Invalid PAN number. Please enter a valid 10-character PAN.',
        testRecordId: authRecord?.testRecordId || null,
        isMockResponse: true,
        verifiedAt,
        verificationTimestamp: verifiedAt,
        details: {
          panFound: false,
          formatValid: false,
          nameComparison: { submitted: submittedName, registered: null, matched: false },
          dobComparison: { submitted: submittedDob, registered: null, matched: false },
        },
      };
    }

    // 2. Determine Provider & Enforce Hard Security Boundary
    const isSynthetic = isSyntheticMockPan(pan);
    const configuredProvider = (process.env.PAN_PROVIDER || 'setu').toLowerCase();
    const requestedProvider = input.provider ? input.provider.toLowerCase() : undefined;

    let activeProviderName: 'mock' | 'setu';

    if (process.env.NODE_ENV === 'production') {
      // In production, mock provider is strictly forbidden.
      if (isSynthetic) {
        throw new AppError(
          `Security Boundary Violation: Synthetic mock PAN [${maskPan(pan)}] must never be transmitted to Setu production or external gateways.`,
          400,
          'MOCK_PAN_SUBMITTED_TO_PRODUCTION'
        );
      }
      activeProviderName = 'setu';
    } else {
      // In development / testing environment:
      if (isSynthetic || requestedProvider === 'mock' || input.isMockFixture) {
        // When a synthetic test fixture is selected, identify it as mock-only and route to Mock PAN Provider
        activeProviderName = 'mock';
      } else {
        // For ordinary user-entered PAN details, use the configured authoritative provider workflow (e.g. Setu)
        activeProviderName = configuredProvider === 'mock' ? 'mock' : 'setu';
      }

      // Safeguard: Even in development, if someone explicitly forces Setu for a synthetic mock PAN, block it
      if (requestedProvider === 'setu' && isSynthetic) {
        throw new AppError(
          `Security Boundary Violation: Synthetic mock PAN [${maskPan(pan)}] must never be transmitted to Setu production or external gateways. Use Mock Provider mode.`,
          400,
          'MOCK_PAN_SUBMITTED_TO_PRODUCTION'
        );
      }
    }

    // 4. Execute Verification with Provider
    if (activeProviderName === 'mock') {
      return await this.verifyWithMockProvider(pan, submittedName, submittedDob, verifiedAt);
    } else {
      return await this.verifyWithSetuProvider(pan, submittedName, submittedDob, verifiedAt);
    }
  }

  /**
   * Deterministic Mock Provider verification using the 25-person synthetic testing dataset.
   */
  private static async verifyWithMockProvider(
    pan: string,
    submittedName: string,
    submittedDob: string,
    verifiedAt: string
  ): Promise<PanIdentityVerificationResult> {
    const authRecord = this.mockProvider.lookupAuthoritativeRecord(pan);

    // PAN does not exist in mock authoritative database
    if (!authRecord.found || !authRecord.registeredName) {
      return {
        success: false,
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
        provider: 'MOCK',
        message: 'PAN number not found in authoritative records.',
        testRecordId: authRecord.testRecordId,
        isMockResponse: true,
        verifiedAt,
        verificationTimestamp: verifiedAt,
        details: {
          panFound: false,
          formatValid: true,
          nameComparison: { submitted: submittedName, registered: null, matched: false },
          dobComparison: { submitted: submittedDob, registered: null, matched: false },
        },
      };
    }

    // Compare Name
    const isNameMatch = normalizeName(submittedName) === normalizeName(authRecord.registeredName);

    // Compare Date of Birth
    const normSubmittedDob = normalizeDate(submittedDob);
    const normRegisteredDob = normalizeDate(authRecord.registeredDob);
    const isDobMatch = Boolean(
      normSubmittedDob &&
      normRegisteredDob &&
      normSubmittedDob === normRegisteredDob
    );

    // Field-level evaluation:
    if (!isNameMatch) {
      return {
        success: false,
        verificationStatus: 'NAME_MISMATCH',
        panStatus: 'VALID',
        nameMatch: false,
        dobMatch: isDobMatch,
        aadhaarLinkStatus: 'UNKNOWN', // Not determined on failed comparison
        registeredName: authRecord.registeredName,
        registeredDob: authRecord.registeredDobDisplay || authRecord.registeredDob,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        provider: 'MOCK',
        message: 'The name entered does not match the name registered against this PAN. Please check the name and try again.',
        testRecordId: authRecord.testRecordId,
        isMockResponse: true,
        verifiedAt,
        verificationTimestamp: verifiedAt,
        details: {
          panFound: true,
          formatValid: true,
          nameComparison: { submitted: submittedName, registered: authRecord.registeredName, matched: false },
          dobComparison: { submitted: submittedDob, registered: authRecord.registeredDobDisplay || authRecord.registeredDob, matched: isDobMatch },
        },
      };
    }

    if (!isDobMatch) {
      return {
        success: false,
        verificationStatus: 'DOB_MISMATCH',
        panStatus: 'VALID',
        nameMatch: true,
        dobMatch: false,
        aadhaarLinkStatus: 'UNKNOWN', // Not determined on failed comparison
        registeredName: authRecord.registeredName,
        registeredDob: authRecord.registeredDobDisplay || authRecord.registeredDob,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        provider: 'MOCK',
        message: 'The date of birth entered does not match the date of birth registered against this PAN. Please check your date of birth.',
        testRecordId: authRecord.testRecordId,
        isMockResponse: true,
        verifiedAt,
        verificationTimestamp: verifiedAt,
        details: {
          panFound: true,
          formatValid: true,
          nameComparison: { submitted: submittedName, registered: authRecord.registeredName, matched: true },
          dobComparison: { submitted: submittedDob, registered: authRecord.registeredDobDisplay || authRecord.registeredDob, matched: false },
        },
      };
    }

    // Both Name and DOB match -> PAN_VERIFIED
    const linkage = await AadhaarLinkageService.getStatus(pan, true);
    const aadhaarLinkStatus = linkage.status;
    const message =
      aadhaarLinkStatus === 'LINKED'
        ? 'PAN verified successfully. Your name and date of birth match the registered records. Aadhaar-PAN linkage is confirmed.'
        : 'PAN verified successfully, but Aadhaar-PAN linkage is not confirmed. Please check your Aadhaar-PAN linking status. You may continue.';

    return {
      success: true,
      verificationStatus: 'PAN_VERIFIED',
      panStatus: 'VALID',
      nameMatch: true,
      dobMatch: true,
      aadhaarLinkStatus,
      registeredName: authRecord.registeredName,
      registeredDob: authRecord.registeredDobDisplay || authRecord.registeredDob,
      submittedName,
      submittedDob,
      maskedPan: maskPan(pan),
      provider: 'MOCK',
      message,
      testRecordId: authRecord.testRecordId,
      isMockResponse: true,
      verifiedAt,
      verificationTimestamp: verifiedAt,
      details: {
        panFound: true,
        formatValid: true,
        nameComparison: { submitted: submittedName, registered: authRecord.registeredName, matched: true },
        dobComparison: { submitted: submittedDob, registered: authRecord.registeredDobDisplay || authRecord.registeredDob, matched: true },
      },
    };
  }

  /**
   * Real authoritative verification using the official Setu PAN Verification gateway.
   */
  private static async verifyWithSetuProvider(
    pan: string,
    submittedName: string,
    submittedDob: string,
    verifiedAt: string
  ): Promise<PanIdentityVerificationResult> {
    let setuProvider: SetuPanProvider;
    try {
      setuProvider = new SetuPanProvider();
    } catch (err: any) {
      return {
        success: false,
        verificationStatus: 'ERROR',
        panStatus: 'INVALID',
        nameMatch: null,
        dobMatch: null,
        aadhaarLinkStatus: 'UNKNOWN',
        registeredName: null,
        registeredDob: null,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        provider: 'SETU',
        message: err.message || 'Setu provider configuration error.',
        isMockResponse: false,
        verifiedAt,
      verificationTimestamp: verifiedAt,
        details: { panFound: false, formatValid: true },
      };
    }

    try {
      const setuRes = await setuProvider.verifyPan({
        pan,
        consent: 'Y',
        reason: 'TaxPilot PAN Identity Verification',
      });

      const isSuccess = setuRes.verification === 'success';
      const registeredName = setuRes.data?.fullName || null;

      if (!isSuccess) {
        const msg = (setuRes.message || '').toLowerCase();
        const isNotFound = msg.includes('not found') || msg.includes('could not be found');

        return {
          success: false,
          verificationStatus: 'INVALID_PAN',
          panStatus: isNotFound ? 'NOT_FOUND' : 'INVALID',
          nameMatch: false,
          dobMatch: false,
          aadhaarLinkStatus: 'UNKNOWN',
          registeredName: null,
          registeredDob: null,
          submittedName,
          submittedDob,
          maskedPan: maskPan(pan),
          provider: 'SETU',
          message: setuRes.message || 'PAN verification rejected by government records.',
          isMockResponse: false,
          verifiedAt,
      verificationTimestamp: verifiedAt,
          details: {
            panFound: false,
            formatValid: true,
            traceId: setuRes.traceId,
            providerRawVerification: setuRes.verification,
          },
        };
      }

      // PAN exists in Setu
      // Name Matching
      let isNameMatch: boolean | null = null;
      if (submittedName && registeredName) {
        isNameMatch = normalizeName(submittedName) === normalizeName(registeredName);
      }

      if (isNameMatch === false) {
        return {
          success: false,
          verificationStatus: 'NAME_MISMATCH',
          panStatus: 'VALID',
          nameMatch: false,
          dobMatch: null, // Setu does not return DOB per government API specification
          aadhaarLinkStatus: 'UNKNOWN',
          registeredName,
          registeredDob: null,
          submittedName,
          submittedDob,
          maskedPan: maskPan(pan),
          provider: 'SETU',
          message: `Name Mismatch: Submitted name differs from government registered name.`,
          isMockResponse: false,
          verifiedAt,
      verificationTimestamp: verifiedAt,
          details: {
            panFound: true,
            formatValid: true,
            nameComparison: { submitted: submittedName, registered: registeredName, matched: false },
            traceId: setuRes.traceId,
            providerRawVerification: setuRes.verification,
          },
        };
      }

      // Resolve Aadhaar linkage directly from Setu's documented response field
      let aadhaarLinkStatus: AadhaarLinkStatus = 'UNKNOWN';
      if (setuRes.data?.aadhaarSeedingStatus) {
        const s = setuRes.data.aadhaarSeedingStatus.toUpperCase();
        if (s === 'LINKED' || s === 'Y') aadhaarLinkStatus = 'LINKED';
        else if (s === 'NOT_LINKED' || s === 'N') aadhaarLinkStatus = 'NOT_LINKED';
      }

      return {
        success: true,
        verificationStatus: 'PAN_VERIFIED',
        panStatus: 'VALID',
        nameMatch: isNameMatch,
        dobMatch: null, // Setu government gateway does not return DOB
        aadhaarLinkStatus,
        registeredName,
        registeredDob: null,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        provider: 'SETU',
        message: 'PAN verified successfully via official Setu gateway.',
        isMockResponse: false,
        verifiedAt,
      verificationTimestamp: verifiedAt,
        details: {
          panFound: true,
          formatValid: true,
          nameComparison: { submitted: submittedName, registered: registeredName, matched: isNameMatch },
          traceId: setuRes.traceId,
          providerRawVerification: setuRes.verification,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        verificationStatus: err.code === 'SETU_TIMEOUT' ? 'UNKNOWN' : 'ERROR',
        panStatus: 'INVALID',
        nameMatch: null,
        dobMatch: null,
        aadhaarLinkStatus: 'UNKNOWN',
        registeredName: null,
        registeredDob: null,
        submittedName,
        submittedDob,
        maskedPan: maskPan(pan),
        provider: 'SETU',
        message: err.message || 'Setu verification gateway is temporarily unavailable.',
        isMockResponse: false,
        verifiedAt,
      verificationTimestamp: verifiedAt,
        details: { panFound: false, formatValid: true },
      };
    }
  }
}
