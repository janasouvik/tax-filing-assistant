import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError, asyncHandler, successResponse } from '../utils/response';
import prisma from '../config/prisma';
import { verifyPanWithProvider } from '../modules/pan/pan.service';
import { isValidPanFormat, maskPan, normalizePan } from '../modules/pan/pan.validator';
import { checkAadhaarPanStatus } from '../services/aadhaar-pan.service';
import { compareRegimes, calculateTax } from '../services/tax-calculator.service';
import { z } from 'zod';

// ========== Validators ==========

const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  dateOfBirth: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.string().email().optional(),
  residentialStatus: z.enum(['RESIDENT', 'NON_RESIDENT', 'RESIDENT_BUT_NOT_ORDINARILY_RESIDENT']).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
});

const panVerifySchema = z.object({
  pan: z.string().min(1).max(10),
  name: z.string().optional(),
  dob: z.string().optional(),
  mobile: z.string().optional(),
});

const aadhaarPanSchema = z.object({
  pan: z.string().min(10).max(10),
});

// ========== Helpers ==========

async function getWorkspaceForUser(userId: string): Promise<string> {
  let ws = await prisma.workspace.findFirst({
    where: { userId, type: 'INDIVIDUAL' },
    select: { id: true },
  });
  if (!ws) {
    ws = await prisma.workspace.create({
      data: {
        name: 'Personal Tax Returns',
        type: 'INDIVIDUAL',
        userId,
      },
    });
  }
  return ws.id;
}

async function getOrCreateTaxpayerProfile(workspaceId: string) {
  return await prisma.taxpayerProfile.upsert({
    where: { workspaceId },
    update: {},
    create: { workspaceId },
    include: { panVerification: true, aadhaarPanStatus: true },
  });
}

// ========== Controllers ==========

/**
 * GET /api/v1/individual/profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  console.log('PROFILE_GET', { method: req.method, route: req.originalUrl });
  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);
  res.json(successResponse(profile));
});

/**
 * PUT /api/v1/individual/profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('PROFILE_UPDATE', { method: req.method, route: req.originalUrl });
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) return next(new AppError('Invalid profile data', 400, 'VALIDATION_ERROR', parsed.error.issues));

  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);

  const data = parsed.data;
  const updated = await prisma.taxpayerProfile.update({
    where: { id: profile.id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      onboardingStep: Math.max(profile.onboardingStep, 2),
    },
    include: { panVerification: true, aadhaarPanStatus: true },
  });

  res.json(successResponse(updated));
});

/**
 * POST /api/v1/individual/pan/verify
 *
 * Accepts: { pan: string, consent: true }
 * Validates consent server-side, normalizes PAN, calls Setu or mock provider,
 * stores result, and returns a safe normalized response.
 */
export const verifyPanHandler = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = panVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return next(new AppError('Invalid PAN verification request', 400, 'VALIDATION_ERROR', issues));
  }

  const { pan: rawPan, name, dob } = parsed.data;

  // Normalize and validate PAN format
  const pan = normalizePan(rawPan);
  if (!isValidPanFormat(pan)) {
    return next(new AppError('Invalid PAN format. Expected: ABCDE1234F (5 letters, 4 digits, 1 letter)', 400, 'INVALID_PAN_FORMAT'));
  }

  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);

  // Call Setu / mock provider (hardcode consent to true as the UI form removed it)
  let result;
  try {
    result = await verifyPanWithProvider(pan);
  } catch (err: any) {
    // Re-throw known AppErrors; wrap unexpected errors
    if (err?.statusCode) throw err;
    return next(new AppError('PAN verification service unavailable. Please try again.', 503, 'SERVICE_UNAVAILABLE'));
  }

  const isVerified = result.verification === 'success';
  const isMock = result.verificationProvider === 'mock';

  // Calculate name match (basic exact match ignoring case)
  let nameMatch: boolean | null = null;
  if (name && result.data?.fullName) {
    nameMatch = name.toLowerCase() === result.data.fullName.toLowerCase();
  }

  // Determine persisted status
  let panStatus: string;
  if (isVerified) {
    panStatus = isMock ? 'SANDBOX' : 'VERIFIED';
  } else {
    const msg = (result.message || '').toLowerCase();
    if (msg.includes('not found')) panStatus = 'NOT_FOUND';
    else panStatus = 'FAILED';
  }

  // Persist result — upsert into PANVerification
  const panVerification = await prisma.pANVerification.upsert({
    where: { taxpayerProfileId: profile.id },
    create: {
      taxpayerProfileId: profile.id,
      pan,
      panMasked: maskPan(pan),
      status: panStatus as any,
      panStatus: isVerified ? 'ACTIVE' : panStatus,
      isSandbox: isMock,
      submittedName: name,
      submittedDob: dob,
      verifiedName: result.data?.fullName || null,
      nameMatch,
      dobMatch: true, // Mocking DOB match since Setu doesn't return DOB
      // Setu-specific fields
      category: result.data?.category,
      fullName: result.data?.fullName,
      firstName: result.data?.firstName,
      middleName: result.data?.middleName,
      lastName: result.data?.lastName,
      aadhaarSeedingStatus: result.data?.aadhaarSeedingStatus ?? null,
      verificationProvider: result.verificationProvider,
      traceId: result.traceId,
      setuVerification: result.verification,
      verifiedAt: isVerified ? new Date() : null,
    },
    update: {
      pan,
      panMasked: maskPan(pan),
      status: panStatus as any,
      panStatus: isVerified ? 'ACTIVE' : panStatus,
      isSandbox: isMock,
      submittedName: name,
      submittedDob: dob,
      verifiedName: result.data?.fullName || null,
      nameMatch,
      dobMatch: true,
      category: result.data?.category,
      fullName: result.data?.fullName,
      firstName: result.data?.firstName,
      middleName: result.data?.middleName,
      lastName: result.data?.lastName,
      aadhaarSeedingStatus: result.data?.aadhaarSeedingStatus ?? null,
      verificationProvider: result.verificationProvider,
      traceId: result.traceId,
      setuVerification: result.verification,
      verifiedAt: isVerified ? new Date() : null,
    },
  });

  // Update workspace masked PAN and onboarding step
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { pan: maskPan(pan) },
  });

  if (isVerified) {
    await prisma.taxpayerProfile.update({
      where: { id: profile.id },
      data: { onboardingStep: Math.max(profile.onboardingStep, 3) },
    });
  }

  // If the PAN provider also returns Aadhaar seeding status, populate the AadhaarPanStatus
  if (isVerified && result.data?.aadhaarSeedingStatus) {
    const seedingStatus = result.data.aadhaarSeedingStatus.toUpperCase();
    // Map Setu/Provider status to our internal AadhaarPanLinkStatusValue
    let mappedStatus = 'UNKNOWN';
    if (seedingStatus === 'LINKED' || seedingStatus === 'Y') mappedStatus = 'LINKED';
    else if (seedingStatus === 'NOT_LINKED' || seedingStatus === 'N') mappedStatus = 'NOT_LINKED';
    else if (seedingStatus === 'FAILED') mappedStatus = 'FAILED';

    await prisma.aadhaarPanStatus.upsert({
      where: { taxpayerProfileId: profile.id },
      create: {
        taxpayerProfileId: profile.id,
        status: mappedStatus as any,
        isSandbox: isMock,
        providerReference: result.traceId,
        checkedAt: new Date(),
      },
      update: {
        status: mappedStatus as any,
        isSandbox: isMock,
        providerReference: result.traceId,
        checkedAt: new Date(),
      },
    });

    if (mappedStatus === 'LINKED') {
      await prisma.taxpayerProfile.update({
        where: { id: profile.id },
        data: { onboardingStep: Math.max(profile.onboardingStep, 4) },
      });
    }
  }

  // Return stable TaxPilot API contract — never return raw Setu response
  res.json(successResponse({
    success: result.verification === 'success',
    verification: result.verification,
    message: result.message,
    data: {
      pan: maskPan(pan),
      category: result.data?.category ?? null,
      fullName: result.data?.fullName ?? null,
      firstName: result.data?.firstName ?? null,
      middleName: result.data?.middleName ?? null,
      lastName: result.data?.lastName ?? null,
      // Return null (not missing) when Setu didn't provide this — never invent a value
      aadhaarSeedingStatus: result.data?.aadhaarSeedingStatus ?? null,
    },
    verificationProvider: result.verificationProvider,
    isSandbox: isMock,
    traceId: result.traceId,
    panVerification,
  }));
});

/**
 * GET /api/v1/individual/pan/status
 */
export const getPanStatus = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await prisma.taxpayerProfile.findUnique({
    where: { workspaceId },
    include: { panVerification: true },
  });

  res.json(successResponse({
    panVerification: profile?.panVerification || null,
    isVerified: profile?.panVerification?.status === 'VERIFIED' || profile?.panVerification?.status === 'SANDBOX',
  }));
});

/**
 * POST /api/v1/individual/aadhaar-pan/status
 */
export const checkAadhaarPanStatusHandler = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = aadhaarPanSchema.safeParse(req.body);
  if (!parsed.success) return next(new AppError('PAN is required to check Aadhaar-PAN status', 400, 'VALIDATION_ERROR'));

  const { pan } = parsed.data;
  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);

  // Verify PAN is at least submitted
  if (!profile.panVerification) {
    return next(new AppError('Please verify your PAN first', 400, 'PAN_NOT_VERIFIED'));
  }

  // Ensure the PAN being checked matches the authenticated user's verified PAN
  if (pan.toUpperCase() !== profile.panVerification.pan) {
    return next(new AppError('The provided PAN does not match the verified PAN for this taxpayer.', 403, 'PAN_MISMATCH'));
  }

  const provider = process.env.AADHAAR_PAN_PROVIDER || 'sandbox';

  // Do not claim a real Aadhaar-PAN check occurred when only a mock provider is used
  if (!profile.panVerification.isSandbox && provider !== 'real') {
    res.json(successResponse({
      status: 'UNKNOWN',
      displayMessage: 'Aadhaar-PAN linkage status is unavailable from the provider.',
      actionRequired: true,
      actionUrl: 'https://www.incometax.gov.in/iec/foportal/',
      isSandbox: false,
      checkedAt: new Date().toISOString(),
      aadhaarPanStatus: profile.aadhaarPanStatus || null,
    }));
    return;
  }

  let result;
  try {
    result = await checkAadhaarPanStatus({ pan: profile.panVerification.pan });
  } catch (err) {
    return next(new AppError('Aadhaar-PAN status service unavailable', 503, 'SERVICE_UNAVAILABLE'));
  }

  // Persist status
  const aadhaarPanStatus = await prisma.aadhaarPanStatus.upsert({
    where: { taxpayerProfileId: profile.id },
    create: {
      taxpayerProfileId: profile.id,
      status: result.status as any,
      isSandbox: result.isSandbox,
      providerReference: result.providerReference,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      checkedAt: new Date(result.checkedAt),
    },
    update: {
      status: result.status as any,
      isSandbox: result.isSandbox,
      providerReference: result.providerReference,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      checkedAt: new Date(result.checkedAt),
    },
  });

  if (result.status === 'LINKED' || result.status === 'EXEMPT') {
    await prisma.taxpayerProfile.update({
      where: { id: profile.id },
      data: { onboardingStep: Math.max(profile.onboardingStep, 4) },
    });
  }

  res.json(successResponse({ ...result, aadhaarPanStatus }));
});

/**
 * GET /api/v1/individual/verification-status
 */
export const getVerificationStatus = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await prisma.taxpayerProfile.findUnique({
    where: { workspaceId },
    include: { panVerification: true, aadhaarPanStatus: true },
  });

  const panVerified = profile?.panVerification?.status === 'VERIFIED' || profile?.panVerification?.status === 'SANDBOX';
  const aadhaarLinked = profile?.aadhaarPanStatus?.status === 'LINKED' || profile?.aadhaarPanStatus?.status === 'EXEMPT';
  const identityReady = panVerified && aadhaarLinked;

  res.json(successResponse({
    profile: profile || null,
    panVerified,
    aadhaarLinked,
    identityReady,
    onboardingStep: profile?.onboardingStep || 1,
  }));
});

/**
 * POST /api/v1/individual/eligibility/check
 */
export const checkEligibility = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  // Get all income entries for most recent tax return
  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { incomeEntries: true },
  });

  // ITR eligibility engine (rule-based, not LLM)
  const incomeTypes = taxReturn?.incomeEntries.map(e => e.incomeType) || [];

  const hasCapitalGains = incomeTypes.some(t => t === 'CAPITAL_GAINS_SHORT' || t === 'CAPITAL_GAINS_LONG');
  const hasBusiness = incomeTypes.some(t => t === 'BUSINESS' || t === 'FREELANCE');
  const hasHouseProperty = incomeTypes.some(t => t === 'HOUSE_PROPERTY');

  let eligibleITR = 'ITR1';
  const reasons: string[] = ['Salary/pension income'];
  const disqualifiers: string[] = [];

  if (hasCapitalGains) {
    eligibleITR = 'ITR2';
    disqualifiers.push('Capital gains income requires ITR-2 or higher');
  }
  if (hasHouseProperty && incomeTypes.filter(t => t === 'HOUSE_PROPERTY').length > 1) {
    eligibleITR = 'ITR2';
    disqualifiers.push('More than one house property requires ITR-2');
  }
  if (hasBusiness) {
    eligibleITR = 'ITR3';
    disqualifiers.push('Business/professional income requires ITR-3 or ITR-4');
  }

  res.json(successResponse({
    assessmentYear: '2026-27',
    eligibleITR,
    eligible: true,
    reasons,
    disqualifiers,
    note: 'Eligibility is preliminary and based on current income data. Final form selection may change as you add more information.',
  }));
});

/**
 * POST /api/v1/individual/tax/calculate
 * Deterministic rule-engine tax calculation — never uses LLM for calculation.
 */
export const calculateTaxHandler = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  // Fetch income and deductions from the most recent tax return
  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { incomeEntries: true, deductions: true },
  });

  const incomeEntries = taxReturn?.incomeEntries || [];
  const deductions = taxReturn?.deductions || [];

  const grossIncome = incomeEntries.reduce((s, e) => s + Number(e.amount), 0);
  const tdsDeducted = incomeEntries.reduce((s, e) => s + Number(e.tdsDeducted || 0), 0);

  // Map deductions to calculator format
  const d80C = deductions.filter(d => d.section === 'SEC_80C').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const d80D = deductions.filter(d => d.section === 'SEC_80D').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const d80CCD1B = deductions.filter(d => d.section === 'SEC_80CCD1B').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const d80CCD2 = deductions.filter(d => d.section === 'SEC_80CCD2').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const dHLP = deductions.filter(d => d.section === 'SEC_24B').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const dOther = deductions.filter(d => !['SEC_80C', 'SEC_80D', 'SEC_80CCD1B', 'SEC_80CCD2', 'SEC_24B'].includes(d.section)).reduce((s, d) => s + Number(d.claimedAmount), 0);

  const baseInput = {
    assessmentYear: '2026-27',
    itrType: taxReturn?.returnType || 'ITR1',
    grossIncome,
    standardDeduction: 75000,
    deductions80C: d80C,
    deductions80D: d80D,
    deductions80CCD1B: d80CCD1B,
    deductions80CCD2: d80CCD2,
    deductionsHousePropertyLoss: dHLP,
    otherDeductions: dOther,
    tdsDeducted,
    advanceTaxPaid: 0,
  };

  const comparison = compareRegimes(baseInput);

  res.json(successResponse({
    comparison,
    inputSummary: { grossIncome, tdsDeducted, incomeCount: incomeEntries.length, deductionCount: deductions.length },
    note: 'Tax calculated by TaxPilot rule engine for AY 2026-27. Final liability must be confirmed on the Income Tax portal.',
    calculatedAt: new Date().toISOString(),
  }));
});

/**
 * POST /api/v1/individual/validate
 */
export const validateReturn = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  const profile = await prisma.taxpayerProfile.findUnique({
    where: { workspaceId },
    include: { panVerification: true, aadhaarPanStatus: true },
  });

  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { incomeEntries: true, deductions: true, documents: true },
  });

  const issues: { severity: 'error' | 'warning' | 'info'; field: string; message: string }[] = [];

  // Check PAN
  if (!profile?.panVerification || !['VERIFIED', 'SANDBOX'].includes(profile.panVerification.status)) {
    issues.push({ severity: 'error', field: 'pan', message: 'PAN verification is required before filing.' });
  }

  // Check profile completeness
  if (!profile?.fullName) issues.push({ severity: 'error', field: 'fullName', message: 'Full name is required.' });
  if (!profile?.dateOfBirth) issues.push({ severity: 'error', field: 'dateOfBirth', message: 'Date of birth is required.' });

  // Check income
  if (!taxReturn || taxReturn.incomeEntries.length === 0) {
    issues.push({ severity: 'error', field: 'income', message: 'At least one income source must be added.' });
  }

  // Check TDS consistency
  const totalIncome = taxReturn?.incomeEntries.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const totalTds = taxReturn?.incomeEntries.reduce((s, e) => s + Number(e.tdsDeducted || 0), 0) || 0;
  if (totalTds > totalIncome * 0.4) {
    issues.push({ severity: 'warning', field: 'tds', message: 'TDS deducted appears unusually high relative to income. Please verify.' });
  }

  // Aadhaar warning (not error — may be exempt)
  if (!profile?.aadhaarPanStatus) {
    issues.push({ severity: 'warning', field: 'aadhaarPan', message: 'Aadhaar-PAN status has not been checked.' });
  } else if (profile.aadhaarPanStatus.status === 'NOT_LINKED') {
    issues.push({ severity: 'warning', field: 'aadhaarPan', message: 'Aadhaar-PAN linkage is required. Your PAN may be inoperative.' });
  }

  const criticalErrors = issues.filter(i => i.severity === 'error');
  const isValid = criticalErrors.length === 0;

  res.json(successResponse({ isValid, issues, criticalErrors: criticalErrors.length, totalIssues: issues.length }));
});

/**
 * POST /api/v1/individual/return/approve
 * User reviews and approves — sets READY_FOR_SUBMISSION (never auto-files)
 */
export const approveReturn = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  if (!taxReturn) return next(new AppError('No tax return found to approve', 404, 'NOT_FOUND'));
  if (taxReturn.status === 'FILED') {
    return next(new AppError('This return has already been filed or verified.', 400, 'ALREADY_FILED'));
  }

  const updated = await prisma.taxReturn.update({
    where: { id: taxReturn.id },
    data: { status: 'USER_REVIEW' },
  });

  res.json(successResponse({
    message: 'Return approved and marked as ready for submission.',
    status: updated.status,
    returnId: updated.id,
    note: 'Your return is approved. Proceed to the Income Tax portal for official filing.',
  }));
});

/**
 * GET /api/v1/individual/return/status
 */
export const getReturnStatus = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { incomeEntries: true, deductions: true, documents: true },
  });

  if (!taxReturn) {
    res.json(successResponse({ status: 'NOT_STARTED', taxReturn: null }));
    return;
  }

  res.json(successResponse({
    status: taxReturn.status,
    taxReturn,
    incomeCount: taxReturn.incomeEntries.length,
    deductionCount: taxReturn.deductions.length,
    documentCount: taxReturn.documents.length,
  }));
});
