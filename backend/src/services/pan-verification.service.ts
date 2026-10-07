/**
 * PAN Verification Service
 *
 * Architecture:
 *   Frontend → POST /api/v1/individual/pan/verify → Backend → PanVerificationAdapter → Normalized Response
 *
 * When real PAN verification credentials are available, implement a real adapter
 * by setting PAN_VERIFICATION_PROVIDER=real and providing PAN_VERIFICATION_API_KEY.
 *
 * Currently uses SANDBOX/MOCK adapter that clearly labels all responses as DEMO.
 */

export interface PanVerificationRequest {
  pan: string;
  name: string;
  dob: string; // DD/MM/YYYY
  mobile?: string;
}

export interface PanVerificationResult {
  verified: boolean;
  pan: string;
  panMasked: string;
  name?: string;
  dob?: string;
  status?: string; // ACTIVE | INACTIVE | INVALID
  nameMatch?: boolean;
  dobMatch?: boolean;
  isSandbox: boolean;
  errorCode?: string;
  errorMessage?: string;
  providerReference?: string;
  verifiedAt?: string;
}

// Utility: validate PAN format
export function isValidPanFormat(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

// Utility: mask PAN (ABCDE1234F → ABCD••••F)
export function maskPan(pan: string): string {
  if (!pan || pan.length !== 10) return pan;
  return pan.slice(0, 4) + '••••' + pan.slice(-1);
}

// Utility: normalize name for comparison
function normalizeName(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, ' ');
}

// Utility: normalize DOB for comparison
function normalizeDob(dob: string): string {
  // Accept DD/MM/YYYY or YYYY-MM-DD
  if (dob.includes('-') && dob.startsWith('19') || dob.startsWith('20')) {
    // YYYY-MM-DD → DD/MM/YYYY
    const [y, m, d] = dob.split('-');
    return `${d}/${m}/${y}`;
  }
  return dob.trim();
}

/**
 * Mock Sandbox Adapter
 * For development only. Clearly labeled as SANDBOX.
 */
async function mockPanVerify(req: PanVerificationRequest): Promise<PanVerificationResult> {
  const pan = req.pan.toUpperCase().trim();

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate invalid PAN format
  if (!isValidPanFormat(pan)) {
    return {
      verified: false,
      pan,
      panMasked: maskPan(pan),
      isSandbox: true,
      errorCode: 'INVALID_PAN_FORMAT',
      errorMessage: 'PAN format is invalid. Expected format: ABCDE1234F',
    };
  }

  // Simulate inactive PAN (PANs ending in X)
  if (pan.endsWith('X')) {
    return {
      verified: false,
      pan,
      panMasked: maskPan(pan),
      status: 'INACTIVE',
      isSandbox: true,
      errorCode: 'PAN_INACTIVE',
      errorMessage: 'Your PAN appears to be inactive.',
    };
  }

  // Simulate successful verification for all other valid PANs
  const submittedName = normalizeName(req.name);
  const submittedDob = normalizeDob(req.dob);

  // In sandbox, consider name and DOB as matched
  const nameMatch = submittedName.length > 0;
  const dobMatch = submittedDob.length > 0;

  return {
    verified: true,
    pan,
    panMasked: maskPan(pan),
    name: submittedName,
    dob: submittedDob,
    status: 'ACTIVE',
    nameMatch,
    dobMatch,
    isSandbox: true,
    providerReference: `SANDBOX-${Date.now()}`,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Main entry point for PAN verification.
 * Dispatches to the appropriate adapter based on environment config.
 */
export async function verifyPan(req: PanVerificationRequest): Promise<PanVerificationResult> {
  const provider = process.env.PAN_VERIFICATION_PROVIDER || 'sandbox';

  if (provider === 'real' && process.env.PAN_VERIFICATION_API_KEY) {
    // TODO: Implement real provider adapter when API credentials are available
    // Example: return realPanVerify(req);
    throw new Error('Real PAN verification provider not yet implemented. Configure PAN_VERIFICATION_PROVIDER=sandbox for development.');
  }

  // Default: sandbox/mock
  return mockPanVerify(req);
}
