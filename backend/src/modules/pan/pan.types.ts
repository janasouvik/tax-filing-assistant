/**
 * PAN Verification — Shared Types
 *
 * These types represent the normalized internal contract between the PAN
 * service layer and the Setu / Mock providers. They are NOT raw Setu responses.
 */

export interface PanVerifyInput {
  /** Uppercase, trimmed, 10-char PAN */
  pan: string;
  /** Must always be "Y" per Setu requirement */
  consent: 'Y';
  /** Server-defined reason — min 20 chars per Setu */
  reason: string;
}

export interface PanVerificationData {
  category?: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  /** Setu returns this as optional */
  aadhaarSeedingStatus?: string | null;
}

export interface PanVerificationResult {
  /** "success" = PAN found & active; "failed" = PAN invalid or not found */
  verification: 'success' | 'failed';
  message?: string;
  traceId?: string;
  data?: PanVerificationData;
  /** Identifies which provider produced this result */
  verificationProvider: 'setu' | 'mock';
}

/** Structured error codes for safe client responses */
export type PanErrorCode =
  | 'INVALID_PAN_FORMAT'
  | 'CONSENT_REQUIRED'
  | 'PAN_NOT_FOUND'
  | 'PAN_INVALID'
  | 'SETU_AUTH_ERROR'
  | 'SETU_TIMEOUT'
  | 'SETU_SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'CONFIG_ERROR'
  | 'SERVICE_UNAVAILABLE';
