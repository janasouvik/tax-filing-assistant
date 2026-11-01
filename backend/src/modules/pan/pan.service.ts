import { SetuPanProvider } from './providers/setu-pan.provider';
import { MockPanProvider } from './providers/mock-pan.provider';
import type { PanProvider } from './providers/pan.provider';
import type { PanVerificationResult } from './pan.types';
import { AppError } from '../../utils/response';
import { isSyntheticMockPan, SYNTHETIC_PAN_DATASET } from './fixtures/synthetic-pan-dataset';
import { maskPan } from './pan.validator';
import {
  IdentityMatchingService,
  IdentityVerifyInput,
  IdentityVerificationResult,
} from './identity-matching.service';
import {
  PanIdentityVerificationService,
  PanIdentityVerifyInput,
  PanIdentityVerificationResult,
  VerificationOutcome,
  PanRecordStatus,
} from './pan-identity-verification.service';
import { AadhaarLinkageService } from './aadhaar-linkage.service';

const SETU_PAN_REASON = 'PAN verification for TaxPilot tax filing assistance';

/**
 * PanService
 *
 * Selects the correct provider based on PAN_PROVIDER env variable,
 * calls it with the normalized input, and returns the result.
 *
 * PAN_PROVIDER=setu  → SetuPanProvider (requires Setu credentials)
 * PAN_PROVIDER=mock  → MockPanProvider (no credentials needed)
 */

function getProvider(): PanProvider {
  const providerName = (process.env.PAN_PROVIDER || 'mock').toLowerCase();

  if (providerName === 'setu') {
    // Constructor throws CONFIG_ERROR if credentials are missing
    return new SetuPanProvider();
  }

  if (providerName === 'mock') {
    return new MockPanProvider();
  }

  throw new AppError(`Unknown PAN_PROVIDER: "${providerName}". Use "setu" or "mock".`, 500, 'CONFIG_ERROR');
}

/**
 * Calls the configured PAN provider with the given PAN and consent.
 * Consent is always "Y" at this point — caller must validate `consent === true`.
 */
export async function verifyPanWithProvider(pan: string): Promise<PanVerificationResult> {
  const providerName = (process.env.PAN_PROVIDER || 'mock').toLowerCase();

  // Hard Security Boundary: Block synthetic mock test fixtures from reaching Setu gateway
  if (providerName === 'setu' && isSyntheticMockPan(pan)) {
    throw new AppError(
      `Security Boundary Violation: Synthetic mock PAN [${maskPan(pan)}] must never be transmitted to Setu production or external gateways. Use Mock Provider mode.`,
      400,
      'MOCK_PAN_SUBMITTED_TO_PRODUCTION'
    );
  }

  const provider = getProvider();

  return provider.verifyPan({
    pan,
    consent: 'Y',
    reason: SETU_PAN_REASON,
  });
}

/**
 * Executes deterministic field-by-field identity verification (PAN existence, Name, DOB).
 */
export async function verifyIdentityWithProvider(
  input: IdentityVerifyInput
): Promise<IdentityVerificationResult> {
  return IdentityMatchingService.verifyIdentity(input);
}

export {
  SETU_PAN_REASON,
  IdentityMatchingService,
  PanIdentityVerificationService,
  AadhaarLinkageService,
  MockPanProvider,
  isSyntheticMockPan,
  SYNTHETIC_PAN_DATASET,
};

export type { IdentityVerifyInput, IdentityVerificationResult } from './identity-matching.service';
export type {
  PanIdentityVerifyInput,
  PanIdentityVerificationResult,
  VerificationOutcome,
  PanRecordStatus,
} from './pan-identity-verification.service';
export { PanPatternClassifierService } from './ml/pan-classifier.service';
export type { PanSubmissionFeatures, PanClassificationResult } from './ml/pan-classifier.service';
