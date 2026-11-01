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

  it('returns success for 25-fixture PAN QWERT1234L (V01)', async () => {
    const input: PanVerifyInput = { pan: 'QWERT1234L', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('success');
    expect(result.verificationProvider).toBe('mock');
    expect(result.data?.fullName).toBe('Aarav Sharma');
    expect(result.data?.aadhaarSeedingStatus).toBe('LINKED');
    expect(result.testRecordId).toBe('V01');
  });

  it('returns success for 25-fixture PAN LKJHG1234R (V06) with NOT_LINKED', async () => {
    const input: PanVerifyInput = { pan: 'LKJHG1234R', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('success');
    expect(result.data?.fullName).toBe('Sneha Patel');
    expect(result.data?.aadhaarSeedingStatus).toBe('NOT_LINKED');
    expect(result.testRecordId).toBe('V06');
  });

  it('returns failed for invalid sandbox PAN ABCDE1234B', async () => {
    const input: PanVerifyInput = { pan: 'ABCDE1234B', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('failed');
    expect(result.verificationProvider).toBe('mock');
    expect(result.data).toBeUndefined();
    expect(result.message).toBe('PAN is invalid.');
  });

  it('returns failed for invalid fixture PAN ABC123 (I01)', async () => {
    const input: PanVerifyInput = { pan: 'ABC123', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('failed');
    expect(result.message).toBe('PAN is invalid.');
  });

  it('returns failed (not found) for unknown valid-format PAN', async () => {
    const input: PanVerifyInput = { pan: 'PPPPP9999P', consent: 'Y', reason: 'test' };
    const result = await provider.verifyPan(input);

    expect(result.verification).toBe('failed');
    expect(result.verificationProvider).toBe('mock');
    expect(result.data).toBeUndefined();
    expect(result.message).toBe('PAN could not be found in Income Tax records.');
  });
});
