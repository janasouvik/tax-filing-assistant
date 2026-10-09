/**
 * Individual Taxpayer API Service
 * All API calls for the Individual filing workflow.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

async function apiRequest<T>(
  path: string,
  options: RequestInit,
  getToken: () => Promise<string | null>
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let json: any = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (err) {
      if (!res.ok) {
        if (res.status === 429) {
          throw Object.assign(new Error('Too many requests. Please wait a moment and try again.'), { code: 'RATE_LIMIT_EXCEEDED', status: 429 });
        }
        throw Object.assign(new Error(text || 'An error occurred'), { code: 'UNKNOWN_ERROR', status: res.status });
      }
      throw new Error('Invalid JSON response from server');
    }
  }

  if (!res.ok) {
    const errMsg = json?.error?.message || (res.status === 429 ? 'Too many requests. Please wait a moment and try again.' : 'An error occurred');
    const errCode = json?.error?.code || 'UNKNOWN_ERROR';
    throw Object.assign(new Error(errMsg), { code: errCode, status: res.status });
  }
  return json.data as T;
}

// ========== Types ==========

export interface TaxpayerProfile {
  id: string;
  workspaceId: string;
  assessmentYear: string;
  fullName?: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  email?: string;
  residentialStatus: 'RESIDENT' | 'NON_RESIDENT' | 'RESIDENT_BUT_NOT_ORDINARILY_RESIDENT';
  state?: string;
  city?: string;
  pinCode?: string;
  filingStatus: string;
  onboardingStep: number;
  panVerification?: PANVerification;
  aadhaarPanStatus?: AadhaarPanStatusRecord;
  createdAt: string;
  updatedAt: string;
}

export interface PANVerification {
  id: string;
  pan: string;
  panMasked: string;
  // Legacy fields
  submittedName?: string;
  submittedDob?: string;
  verifiedName?: string;
  verifiedDob?: string;
  panStatus?: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'INACTIVE' | 'NAME_MISMATCH' | 'DOB_MISMATCH' | 'SERVICE_UNAVAILABLE' | 'SANDBOX' | 'NOT_FOUND';
  nameMatch?: boolean;
  dobMatch?: boolean;
  // New Setu fields
  category?: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  aadhaarSeedingStatus?: string | null;
  verificationProvider?: string;
  traceId?: string;
  setuVerification?: string;

  isSandbox: boolean;
  errorCode?: string;
  errorMessage?: string;
  verifiedAt?: string;
}

export interface PANVerificationData {
  pan: string;
  category?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  aadhaarSeedingStatus?: string | null;
}

export interface PANVerificationResult {
  success: boolean;
  verification: 'success' | 'failed';
  message?: string;
  data?: PANVerificationData;
  verificationProvider: string;
  traceId?: string;
  panVerification: PANVerification;
  isSandbox?: boolean;
  pan?: string;
  name?: string;
  dob?: string;
  nameMatch?: boolean;
  dobMatch?: boolean;
  status?: string;
  verified?: boolean;
}

export type AadhaarPanLinkStatusValue =
  | 'LINKED'
  | 'NOT_LINKED'
  | 'PENDING'
  | 'FAILED'
  | 'PAN_INOPERATIVE'
  | 'EXEMPT'
  | 'UNKNOWN'
  | 'SERVICE_UNAVAILABLE';

export interface AadhaarPanStatusRecord {
  id: string;
  status: AadhaarPanLinkStatusValue;
  isSandbox: boolean;
  errorCode?: string;
  checkedAt?: string;
}

export interface AadhaarPanStatusResult {
  status: AadhaarPanLinkStatusValue;
  displayMessage: string;
  actionRequired: boolean;
  actionUrl?: string;
  isSandbox: boolean;
  providerReference?: string;
  checkedAt: string;
  aadhaarPanStatus: AadhaarPanStatusRecord;
}

export interface VerificationStatus {
  profile: TaxpayerProfile | null;
  panVerified: boolean;
  aadhaarLinked: boolean;
  identityReady: boolean;
  onboardingStep: number;
}

export interface EligibilityResult {
  assessmentYear: string;
  eligibleITR: string;
  eligible: boolean;
  reasons: string[];
  disqualifiers: string[];
  note: string;
}

// ========== API Calls ==========

export const individualApi = {
  getProfile: (getToken: () => Promise<string | null>) =>
    apiRequest<TaxpayerProfile>('/individual/profile', { method: 'GET' }, getToken),

  updateProfile: (getToken: () => Promise<string | null>, data: Partial<TaxpayerProfile>) =>
    apiRequest<TaxpayerProfile>('/individual/profile', { method: 'PUT', body: JSON.stringify(data) }, getToken),

  verifyPan: (getToken: () => Promise<string | null>, data: { pan: string; name?: string; dob?: string; mobile?: string }) =>
    apiRequest<PANVerificationResult>('/individual/pan/verify', { method: 'POST', body: JSON.stringify(data) }, getToken),

  getPanStatus: (getToken: () => Promise<string | null>) =>
    apiRequest<{ panVerification: PANVerification | null; isVerified: boolean }>('/individual/pan/status', { method: 'GET' }, getToken),

  checkAadhaarPanStatus: (getToken: () => Promise<string | null>, pan: string) =>
    apiRequest<AadhaarPanStatusResult>('/individual/aadhaar-pan/status', { method: 'POST', body: JSON.stringify({ pan }) }, getToken),

  getVerificationStatus: (getToken: () => Promise<string | null>) =>
    apiRequest<VerificationStatus>('/individual/verification-status', { method: 'GET' }, getToken),

  checkEligibility: (getToken: () => Promise<string | null>) =>
    apiRequest<EligibilityResult>('/individual/eligibility/check', { method: 'POST', body: JSON.stringify({}) }, getToken),
};
