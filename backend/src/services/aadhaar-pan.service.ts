/**
 * Aadhaar-PAN Link Status Service
 *
 * Architecture:
 *   Frontend → POST /api/v1/individual/aadhaar-pan/status → Backend → AadhaarPanStatusAdapter → Normalized Status
 *
 * IMPORTANT:
 * - Aadhaar-PAN linkage is NOT the same as ITR e-verification.
 * - We do NOT collect or store raw Aadhaar numbers.
 * - This service only checks the current link status via authorized channels.
 * - When credentials are available, implement a real adapter.
 *
 * Reference: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/link-aadhaar
 */

export type AadhaarPanLinkStatusValue =
  | 'LINKED'
  | 'NOT_LINKED'
  | 'PENDING'
  | 'FAILED'
  | 'PAN_INOPERATIVE'
  | 'EXEMPT'
  | 'UNKNOWN'
  | 'SERVICE_UNAVAILABLE';

export interface AadhaarPanStatusRequest {
  pan: string;
  // NOTE: Aadhaar number is NOT stored or logged
  // Only used transiently for the API call if required by the authorized provider
  aadhaarLastFour?: string; // Only last 4 digits, for display masking purposes only
}

export interface AadhaarPanStatusResult {
  status: AadhaarPanLinkStatusValue;
  displayMessage: string;
  actionRequired: boolean;
  actionUrl?: string;
  isSandbox: boolean;
  providerReference?: string;
  errorCode?: string;
  errorMessage?: string;
  checkedAt: string;
}

const STATUS_MESSAGES: Record<AadhaarPanLinkStatusValue, { message: string; actionRequired: boolean }> = {
  LINKED: {
    message: 'Your PAN and Aadhaar are linked.',
    actionRequired: false,
  },
  NOT_LINKED: {
    message: 'Aadhaar-PAN linkage is required. Please complete this on the Income Tax portal.',
    actionRequired: true,
  },
  PENDING: {
    message: 'Your Aadhaar-PAN linking request is currently under validation.',
    actionRequired: false,
  },
  FAILED: {
    message: 'Aadhaar-PAN linkage validation failed. Please contact the Income Tax Department.',
    actionRequired: true,
  },
  PAN_INOPERATIVE: {
    message: 'Your PAN appears to be inoperative. Please resolve this on the Income Tax portal.',
    actionRequired: true,
  },
  EXEMPT: {
    message: 'Aadhaar-PAN linkage requirement does not apply based on available taxpayer information.',
    actionRequired: false,
  },
  UNKNOWN: {
    message: 'Unable to determine current Aadhaar-PAN link status.',
    actionRequired: true,
  },
  SERVICE_UNAVAILABLE: {
    message: 'The Aadhaar-PAN status service is temporarily unavailable. Please try again later.',
    actionRequired: false,
  },
};

const INCOME_TAX_PORTAL_URL = 'https://www.incometax.gov.in/iec/foportal/';

/**
 * Mock Sandbox Adapter
 * For development only. Clearly labeled as SANDBOX.
 */
async function mockAadhaarPanStatus(req: AadhaarPanStatusRequest): Promise<AadhaarPanStatusResult> {
  const pan = req.pan.toUpperCase().trim();

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Simulate different statuses based on PAN patterns for testing
  let status: AadhaarPanLinkStatusValue = 'LINKED';

  if (pan === 'ABCDE1234A') {
    status = 'LINKED';
  } else if (pan.charAt(4) === 'C') {
    status = 'NOT_LINKED';
  } else if (pan.charAt(4) === 'D') {
    status = 'PENDING';
  } else if (pan.charAt(4) === 'E') {
    status = 'PAN_INOPERATIVE';
  }

  const statusInfo = STATUS_MESSAGES[status];

  return {
    status,
    displayMessage: statusInfo.message,
    actionRequired: statusInfo.actionRequired,
    actionUrl: statusInfo.actionRequired ? INCOME_TAX_PORTAL_URL : undefined,
    isSandbox: true,
    providerReference: `SANDBOX-AADHAAR-${Date.now()}`,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Main entry point for Aadhaar-PAN status check.
 */
export async function checkAadhaarPanStatus(req: AadhaarPanStatusRequest): Promise<AadhaarPanStatusResult> {
  const provider = process.env.AADHAAR_PAN_PROVIDER || 'sandbox';

  if (provider === 'real' && process.env.AADHAAR_PAN_API_KEY) {
    // TODO: Implement real provider adapter when API credentials are available
    throw new Error('Real Aadhaar-PAN provider not yet implemented.');
  }

  return mockAadhaarPanStatus(req);
}

export { STATUS_MESSAGES, INCOME_TAX_PORTAL_URL };
