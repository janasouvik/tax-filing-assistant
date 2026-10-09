import { describe, it, expect } from 'vitest';
import { MockPanProvider } from './mock-pan.provider';
import type { PanVerifyInput } from '../pan.types';

describe('MockPanProvider', () => {
  const provider = new MockPanProvider();

  it('returns success for valid sandbox PAN ABCDE1234A', async () => {
    const input: PanVerifyInput = { pan: 'ABCDE1234A', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('success');
    expect(result.verificationProvider).toBe('mock');
    expect(result.data).toBeDefined();
    expect(result.data?.fullName).toBe('John Doe');
    expect(result.data?.aadhaarSeedingStatus).toBe('LINKED');
  });

  it('returns failed for invalid sandbox PAN ABCDE1234B', async () => {
    const input: PanVerifyInput = { pan: 'ABCDE1234B', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('failed');
    expect(result.verificationProvider).toBe('mock');
    expect(result.data).toBeUndefined();
    expect(result.message).toBe('PAN is invalid');
  });

  it('returns failed (not found) for any other PAN', async () => {
    const input: PanVerifyInput = { pan: 'PPPPP9999P', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('failed');
    expect(result.verificationProvider).toBe('mock');
    expect(result.data).toBeUndefined();
    expect(result.message).toBe('PAN could not be found.');
  });
});
