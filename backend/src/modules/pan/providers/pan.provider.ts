import type { PanVerifyInput, PanVerificationResult } from '../pan.types';

/**
 * PanProvider interface.
 * All PAN verification providers (Setu, Mock, future) must implement this.
 */
export interface PanProvider {
  verifyPan(input: PanVerifyInput): Promise<PanVerificationResult>;
}
