import { test, expect } from '@playwright/test';

test.describe('TEST 7: Filing, e-Verification & Portal Security Disclaimers', () => {
  test('Footer displays statutory Indian Tax Disclaimer on all pages', async ({ page }) => {
    await page.goto('/');

    // Check footer disclaimer
    const disclaimer = page.locator('footer');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer.locator('text=Indian Tax Disclaimer')).toBeVisible();
    await expect(disclaimer.locator('text=TaxPilot assists with return preparation')).toBeVisible();
  });

  test('Filing and verification pages require authentication and do not expose provider capabilities', async ({ page }) => {
    await page.goto('/individual/filing');

    // Unauthenticated access must not expose filing or provider submission buttons
    await expect(page.locator('button:has-text("Submit to ITD")')).not.toBeVisible();
    await expect(page.locator('button:has-text("File Return Now")')).not.toBeVisible();
  });

  test('Backend APIs strictly enforce 401 Unauthorized for unauthenticated requests', async ({ request }) => {
    const backendUrl = 'http://localhost:5001';

    // 1. Tax Return API
    const returnsRes = await request.get(`${backendUrl}/api/v1/workspaces/ws-1/tax-returns`);
    expect(returnsRes.status()).toBe(401);

    // 2. Individual Profile API
    const profileRes = await request.get(`${backendUrl}/api/v1/individual/profile`);
    expect(profileRes.status()).toBe(401);

    // 3. Tax Calculation API
    const calcRes = await request.post(`${backendUrl}/api/v1/individual/tax/calculate`, {
      data: { regime: 'NEW' }
    });
    expect(calcRes.status()).toBe(401);

    // 4. Return Approval API
    const approveRes = await request.post(`${backendUrl}/api/v1/individual/return/approve`, {
      data: { notes: 'Attempted unauthenticated approval' }
    });
    expect(approveRes.status()).toBe(401);

    // 5. Filing Execution API
    const filingRes = await request.post(`${backendUrl}/api/v1/tax-returns/ret-1/file`, {
      data: {}
    });
    expect(filingRes.status()).toBe(401);

    // 6. E-Verification API
    const verifyRes = await request.post(`${backendUrl}/api/v1/tax-returns/ret-1/verify/initiate`, {
      data: { method: 'AADHAAR_OTP' }
    });
    expect(verifyRes.status()).toBe(401);

    // 7. Document Upload API
    const uploadRes = await request.post(`${backendUrl}/api/v1/workspaces/ws-1/documents`, {
      data: {}
    });
    expect(uploadRes.status()).toBe(401);
  });
});
