import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError, asyncHandler, successResponse } from '../utils/response';
import prisma from '../config/prisma';
import { verifyPan, isValidPanFormat, maskPan } from '../services/pan-verification.service';
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
  pan: z.string().min(10).max(10).regex(/^[A-Z0-9]{10}$/, 'Invalid PAN format'),
  name: z.string().min(1).max(200),
  dob: z.string().min(8), // DD/MM/YYYY
  mobile: z.string().optional(),
});

const aadhaarPanSchema = z.object({
  pan: z.string().min(10).max(10),
});

// ========== Helpers ==========

async function getWorkspaceForUser(userId: string): Promise<string> {
  const ws = await prisma.workspace.findFirst({
    where: { userId, type: 'INDIVIDUAL' },
    select: { id: true },
  });
  if (!ws) throw new AppError('Individual workspace not found. Please complete onboarding.', 404, 'WORKSPACE_NOT_FOUND');
  return ws.id;
}

async function getOrCreateTaxpayerProfile(workspaceId: string) {
  let profile = await prisma.taxpayerProfile.findUnique({
    where: { workspaceId },
    include: { panVerification: true, aadhaarPanStatus: true },
  });

  if (!profile) {
    profile = await prisma.taxpayerProfile.create({
      data: { workspaceId },
      include: { panVerification: true, aadhaarPanStatus: true },
    });
  }

  return profile;
}

// ========== Controllers ==========

/**
 * GET /api/v1/individual/profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);
  res.json(successResponse(profile));
});

/**
 * PUT /api/v1/individual/profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
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
 */
export const verifyPanHandler = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = panVerifySchema.safeParse(req.body);
  if (!parsed.success) return next(new AppError('Invalid PAN verification request', 400, 'VALIDATION_ERROR', parsed.error.issues));

  const { pan, name, dob, mobile } = parsed.data;
  const panUpper = pan.toUpperCase();

  if (!isValidPanFormat(panUpper)) {
    return next(new AppError('Invalid PAN format. Expected: ABCDE1234F', 400, 'INVALID_PAN_FORMAT'));
  }

  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);

  // Call verification service
  let result;
  try {
    result = await verifyPan({ pan: panUpper, name, dob, mobile });
  } catch (err) {
    return next(new AppError('PAN verification service unavailable. Please try again.', 503, 'SERVICE_UNAVAILABLE'));
  }

  // Persist result
  const panVerification = await prisma.pANVerification.upsert({
    where: { taxpayerProfileId: profile.id },
    create: {
      taxpayerProfileId: profile.id,
      pan: panUpper,
      panMasked: maskPan(panUpper),
      submittedName: name,
      submittedDob: dob,
      verifiedName: result.name,
      verifiedDob: result.dob,
      panStatus: result.status,
      status: result.verified ? 'VERIFIED' : (
        result.errorCode === 'PAN_INACTIVE' ? 'INACTIVE' :
        result.errorCode === 'NAME_MISMATCH' ? 'NAME_MISMATCH' :
        result.errorCode === 'DOB_MISMATCH' ? 'DOB_MISMATCH' :
        result.errorCode === 'SERVICE_UNAVAILABLE' ? 'SERVICE_UNAVAILABLE' :
        'SANDBOX'
      ),
      nameMatch: result.nameMatch,
      dobMatch: result.dobMatch,
      isSandbox: result.isSandbox,
      providerReference: result.providerReference,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      verifiedAt: result.verifiedAt ? new Date(result.verifiedAt) : null,
    },
    update: {
      pan: panUpper,
      panMasked: maskPan(panUpper),
      submittedName: name,
      submittedDob: dob,
      verifiedName: result.name,
      verifiedDob: result.dob,
      panStatus: result.status,
      status: result.verified ? 'VERIFIED' : (
        result.errorCode === 'PAN_INACTIVE' ? 'INACTIVE' :
        result.errorCode === 'NAME_MISMATCH' ? 'NAME_MISMATCH' :
        result.errorCode === 'DOB_MISMATCH' ? 'DOB_MISMATCH' :
        result.errorCode === 'SERVICE_UNAVAILABLE' ? 'SERVICE_UNAVAILABLE' :
        'SANDBOX'
      ),
      nameMatch: result.nameMatch,
      dobMatch: result.dobMatch,
      isSandbox: result.isSandbox,
      providerReference: result.providerReference,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      verifiedAt: result.verifiedAt ? new Date(result.verifiedAt) : null,
    },
  });

  // Update workspace PAN (masked) and onboarding step
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { pan: maskPan(panUpper) },
  });

  if (result.verified) {
    await prisma.taxpayerProfile.update({
      where: { id: profile.id },
      data: { onboardingStep: Math.max(profile.onboardingStep, 3) },
    });
  }

  res.json(successResponse({ ...result, panVerification }));
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
    isVerified: profile?.panVerification?.status === 'VERIFIED',
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

  let result;
  try {
    result = await checkAadhaarPanStatus({ pan: pan.toUpperCase() });
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

  const panVerified = profile?.panVerification?.status === 'VERIFIED';
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
  const dOther = deductions.filter(d => !['SEC_80C','SEC_80D','SEC_80CCD1B','SEC_80CCD2','SEC_24B'].includes(d.section)).reduce((s, d) => s + Number(d.claimedAmount), 0);

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
  if (!profile?.panVerification || !['VERIFIED','SANDBOX'].includes(profile.panVerification.status)) {
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
