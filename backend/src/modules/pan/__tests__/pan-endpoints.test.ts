import { describe, it, expect } from 'vitest';
import { verifyIdentityHandler } from '../../../controllers/individual.controller';
import { SYNTHETIC_PAN_DATASET } from '../fixtures/synthetic-pan-dataset';

describe('PAN Identity Verification Endpoint Handlers', () => {
  it('verifyIdentityHandler handles all 25 synthetic fixtures accurately', async () => {
    for (const fixture of SYNTHETIC_PAN_DATASET) {
      const req = {
        body: {
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
          provider: 'mock',
        },
      };

      let responseJson: any = null;
      await new Promise<void>((resolve, reject) => {
        const next = (err: any) => (err ? reject(err) : resolve());
        const res: any = {
          json: (data: any) => {
            responseJson = data;
            resolve();
          },
          status: () => res,
        };
        (verifyIdentityHandler as any)(req, res, next);
      });

      expect(responseJson).not.toBeNull();
      expect(responseJson.data).toBeDefined();

      const data = responseJson.data;
      expect(data.verificationStatus).toBe(fixture.expectedResult);
      expect(data.isMockResponse).toBe(true);

      if (fixture.expectedResult === 'PAN_VERIFIED') {
        expect(data.success).toBe(true);
        expect(data.panStatus).toBe('VALID');
        expect(data.nameMatch).toBe(true);
        expect(data.dobMatch).toBe(true);
        expect(data.aadhaarLinkStatus).toBe(fixture.aadhaarStatus);
      } else if (fixture.expectedResult === 'NAME_MISMATCH') {
        expect(data.success).toBe(false);
        expect(data.nameMatch).toBe(false);
        expect(data.aadhaarLinkStatus).toBe('UNKNOWN');
      } else if (fixture.expectedResult === 'DOB_MISMATCH') {
        expect(data.success).toBe(false);
        expect(data.dobMatch).toBe(false);
        expect(data.aadhaarLinkStatus).toBe('UNKNOWN');
      } else if (fixture.expectedResult === 'INVALID_PAN' || fixture.expectedResult === 'INVALID_PAN_FORMAT') {
        expect(data.success).toBe(false);
        expect(data.aadhaarLinkStatus).toBe('UNKNOWN');
      }
    }
  });

  it('verifyIdentityHandler handles invalid format correctly', async () => {
    const req = {
      body: {
        pan: 'ABC123',
        name: 'Aarav Sharma',
        dob: '12/03/1998',
      },
    };

    let responseJson: any = null;
    await new Promise<void>((resolve, reject) => {
      const next = (err: any) => (err ? reject(err) : resolve());
      const res: any = {
        json: (data: any) => {
          responseJson = data;
          resolve();
        },
        status: () => res,
      };
      (verifyIdentityHandler as any)(req, res, next);
    });

    expect(responseJson.data.verificationStatus).toBe('INVALID_PAN_FORMAT');
    expect(responseJson.data.panStatus).toBe('INVALID');
    expect(responseJson.data.details.formatValid).toBe(false);
  });
});
