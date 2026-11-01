import type { PanProvider } from './pan.provider';
import type { PanVerifyInput, PanVerificationResult } from '../pan.types';
import { findSyntheticRecordByPan, SYNTHETIC_PAN_DATASET } from '../fixtures/synthetic-pan-dataset';

export interface AuthoritativeMockRecord {
  found: boolean;
  pan: string;
  registeredName: string | null;
  registeredDob: string | null; // Canonical YYYY-MM-DD
  registeredDobDisplay: string | null; // DD/MM/YYYY
  aadhaarStatus: 'LINKED' | 'NOT_LINKED' | 'UNKNOWN';
  testRecordId: string | null;
  category: string;
}

/**
 * MockPanProvider
 *
 * Deterministic Mock PAN Provider built upon the 25-person synthetic testing dataset.
 * Simulates an authoritative government verification database for local development and testing.
 *
 * All responses clearly set verificationProvider = "mock" and isMockResponse = true.
 */
export class MockPanProvider implements PanProvider {
  /**
   * Looks up the registered authoritative record for a PAN.
   */
  public lookupAuthoritativeRecord(pan: string): AuthoritativeMockRecord {
    const normPan = (pan || '').toUpperCase().trim();

    // Check synthetic fixture dataset
    const fixture = findSyntheticRecordByPan(normPan);
    if (fixture) {
      // If the fixture belongs to Group B (invalid PAN), it does not exist as a valid record
      if (fixture.group === 'INVALID_PAN') {
        return {
          found: false,
          pan: normPan,
          registeredName: null,
          registeredDob: null,
          registeredDobDisplay: null,
          aadhaarStatus: 'UNKNOWN',
          testRecordId: fixture.id,
          category: 'Individual',
        };
      }

      // Groups A, C, D exist in the authoritative database
      return {
        found: true,
        pan: normPan,
        registeredName: fixture.registeredName,
        registeredDob: fixture.registeredDob,
        registeredDobDisplay: fixture.registeredDobDisplay,
        aadhaarStatus: fixture.aadhaarStatus,
        testRecordId: fixture.id,
        category: 'Individual',
      };
    }

    // Historical Setu sandbox "valid" PAN test value
    if (normPan === 'ABCDE1234A') {
      return {
        found: true,
        pan: normPan,
        registeredName: 'John Doe',
        registeredDob: '1990-01-01',
        registeredDobDisplay: '01/01/1990',
        aadhaarStatus: 'LINKED',
        testRecordId: 'SANDBOX_VALID',
        category: 'Individual',
      };
    }

    // Default: PAN does not exist in authoritative database
    return {
      found: false,
      pan: normPan,
      registeredName: null,
      registeredDob: null,
      registeredDobDisplay: null,
      aadhaarStatus: 'UNKNOWN',
      testRecordId: null,
      category: 'Individual',
    };
  }

  /**
   * Standard PanProvider interface implementation.
   */
  async verifyPan(input: PanVerifyInput): Promise<PanVerificationResult> {
    // Simulate realistic gateway response delay (approx 150-250ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    const pan = (input.pan || '').toUpperCase().trim();
    const record = this.lookupAuthoritativeRecord(pan);

    if (record.found && record.registeredName) {
      const names = record.registeredName.split(' ');
      return {
        verification: 'success',
        message: 'PAN is valid and active in Income Tax Department records.',
        traceId: `MOCK-${record.testRecordId || 'TX'}-${Date.now()}`,
        verificationProvider: 'mock',
        testRecordId: record.testRecordId,
        data: {
          category: record.category,
          fullName: record.registeredName,
          firstName: names[0] || record.registeredName,
          middleName: names.length > 2 ? names.slice(1, -1).join(' ') : undefined,
          lastName: names.length > 1 ? names[names.length - 1] : undefined,
          aadhaarSeedingStatus: record.aadhaarStatus,
          dateOfBirth: record.registeredDob,
        },
      };
    }

    // Check if it's explicitly an invalid PAN from Group B or legacy ABCDE1234B
    if (pan === 'ABCDE1234B' || ['ABC123', '12345ABCDE', 'ABCDE123', 'ABCDE12XYZ', '1234567890'].includes(pan)) {
      return {
        verification: 'failed',
        message: 'PAN is invalid.',
        traceId: `MOCK-INV-${Date.now()}`,
        verificationProvider: 'mock',
        testRecordId: record.testRecordId,
      };
    }

    // Not found
    return {
      verification: 'failed',
      message: 'PAN could not be found in Income Tax records.',
      traceId: `MOCK-NF-${Date.now()}`,
      verificationProvider: 'mock',
      testRecordId: null,
    };
  }

  /**
   * Returns all 25 synthetic fixtures for inspection / test bench UI.
   */
  public getFixtures() {
    return SYNTHETIC_PAN_DATASET;
  }
}
