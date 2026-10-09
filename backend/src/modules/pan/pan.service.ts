import { SetuPanProvider } from './providers/setu-pan.provider';
import { MockPanProvider } from './providers/mock-pan.provider';
import type { PanProvider } from './providers/pan.provider';
import type { PanVerificationResult } from './pan.types';
import { AppError } from '../../utils/response';

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
  const provider = getProvider();

  return provider.verifyPan({
    pan,
    consent: 'Y',
    reason: SETU_PAN_REASON,
  });
}

export { SETU_PAN_REASON };
