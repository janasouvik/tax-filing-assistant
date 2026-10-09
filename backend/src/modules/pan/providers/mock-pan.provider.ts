import type { PanProvider } from './pan.provider';
import type { PanVerifyInput, PanVerificationResult } from '../pan.types';

/**
 * MockPanProvider
 *
 * Development-only provider. Clearly identifies all results as provider: "mock".
 * Behavior mirrors Setu sandbox documented test values:
 *
 *   ABCDE1234A → successful verification
 *   ABCDE1234B → invalid PAN (verification: "failed")
 *   Any other valid format → PAN not found (verification: "failed", no data)
 *
 * IMPORTANT: Mock mode must NEVER be mistaken for real government verification.
 * Every response sets verificationProvider = "mock".
 */
export class MockPanProvider implements PanProvider {
  async verifyPan(input: PanVerifyInput): Promise<PanVerificationResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const pan = input.pan;

    // Setu sandbox "valid" PAN test value
    if (pan === 'ABCDE1234A') {
      return {
        verification: 'success',
        message: 'PAN is valid',
        traceId: `MOCK-${Date.now()}`,
        verificationProvider: 'mock',
        data: {
          category: 'Individual',
          fullName: 'John Doe',
          firstName: 'John',
          middleName: undefined,
          lastName: 'Doe',
          // Return null to correctly test the "aadhaarSeedingStatus not provided" path
          aadhaarSeedingStatus: 'LINKED',
        },
      };
    }

    // Setu sandbox "invalid PAN" test value
    if (pan === 'ABCDE1234B') {
      return {
        verification: 'failed',
        message: 'PAN is invalid',
        traceId: `MOCK-${Date.now()}`,
        verificationProvider: 'mock',
      };
    }

    // Any other PAN → not found
    return {
      verification: 'failed',
      message: 'PAN could not be found.',
      traceId: `MOCK-${Date.now()}`,
      verificationProvider: 'mock',
    };
  }
}
