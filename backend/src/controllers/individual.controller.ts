import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError, asyncHandler, successResponse } from '../utils/response';
import prisma from '../config/prisma';
import {
  verifyPanWithProvider,
  IdentityMatchingService,
  PanIdentityVerificationService,
  SYNTHETIC_PAN_DATASET,
} from '../modules/pan/pan.service';
import { PanPatternClassifierService } from '../modules/pan/ml/pan-classifier.service';
import { isValidPanFormat, maskPan, normalizePan } from '../modules/pan/pan.validator';
import { checkAadhaarPanStatus } from '../services/aadhaar-pan.service';
import { getClientIp, generateApprovalHash, CanonicalFinancialSnapshot } from '../utils/helpers';
import { invalidateTaxCalculationsAndResetStatus } from '../services/taxReturn.service';
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
  pan: z.string().min(1).max(25),
  name: z.string().optional(),
  dob: z.string().optional(),
  mobile: z.string().optional(),
  provider: z.enum(['mock', 'setu']).optional(),
  isMockFixture: z.boolean().optional(),
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
  const isTaxImpactingChange = Boolean(
    (data.dateOfBirth && (!profile.dateOfBirth || profile.dateOfBirth.toISOString().slice(0, 10) !== new Date(data.dateOfBirth).toISOString().slice(0, 10))) ||
    (data.residentialStatus && profile.residentialStatus !== data.residentialStatus)
  );

  const updated = await prisma.$transaction(async (tx) => {
    const updatedProf = await tx.taxpayerProfile.update({
      where: { id: profile.id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        onboardingStep: Math.max(profile.onboardingStep, 2),
      },
      include: { panVerification: true, aadhaarPanStatus: true },
    });

    if (isTaxImpactingChange) {
      const activeReturns = await tx.taxReturn.findMany({
        where: {
          workspaceId,
          status: { notIn: ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'] },
        },
      });

      for (const ret of activeReturns) {
        await invalidateTaxCalculationsAndResetStatus(ret.id, tx);
      }
    }

    return updatedProf;
  });

  res.json(successResponse(updated));
});


/**
 * POST /api/v1/individual/pan/verify
 *
 * Accepts: { pan: string, name?: string, dob?: string, mobile?: string }
 * Normalizes input, calls unified PanIdentityVerificationService,
 * stores result in Prisma, updates taxpayer profile/onboarding step,
 * updates AadhaarPanStatus if linkage is known, and returns standardized response.
 */
export const verifyPanHandler = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = panVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return next(new AppError('Invalid PAN verification request', 400, 'VALIDATION_ERROR', issues));
  }

  const { pan: rawPan, name, dob, mobile, provider, isMockFixture } = parsed.data;

  // Normalize PAN
  const pan = normalizePan(rawPan);

  const workspaceId = await getWorkspaceForUser(req.user!.userId);
  const profile = await getOrCreateTaxpayerProfile(workspaceId);

  // Call the unified PanIdentityVerificationService
  let result;
  try {
    result = await PanIdentityVerificationService.verifyIdentity({
      pan,
      name,
      dob,
      mobile,
      provider,
      isMockFixture,
    });
  } catch (err: any) {
    // Re-throw known AppErrors (e.g., MOCK_PAN_SUBMITTED_TO_PRODUCTION); wrap unexpected errors
    if (err?.statusCode) throw err;
    return next(new AppError('PAN verification service unavailable. Please try again.', 503, 'SERVICE_UNAVAILABLE'));
  }

  const isVerified = result.verificationStatus === 'PAN_VERIFIED';
  const isMock = result.isMockResponse;

  // Map result.verificationStatus to Prisma PANVerificationStatus enum
  let dbStatus: 'VERIFIED' | 'SANDBOX' | 'NAME_MISMATCH' | 'DOB_MISMATCH' | 'NOT_FOUND' | 'FAILED' | 'SERVICE_UNAVAILABLE';
  if (isVerified) {
    dbStatus = isMock ? 'SANDBOX' : 'VERIFIED';
  } else if (result.verificationStatus === 'NAME_MISMATCH') {
    dbStatus = 'NAME_MISMATCH';
  } else if (result.verificationStatus === 'DOB_MISMATCH') {
    dbStatus = 'DOB_MISMATCH';
  } else if (result.verificationStatus === 'INVALID_PAN_FORMAT') {
    dbStatus = 'FAILED';
  } else if (result.verificationStatus === 'INVALID_PAN') {
    dbStatus = result.panStatus === 'NOT_FOUND' ? 'NOT_FOUND' : 'FAILED';
  } else {
    dbStatus = 'FAILED';
  }

  // Persist result — upsert into PANVerification
  const panVerification = await prisma.pANVerification.upsert({
    where: { taxpayerProfileId: profile.id },
    create: {
      taxpayerProfileId: profile.id,
      pan,
      panMasked: maskPan(pan),
      status: dbStatus as any,
      panStatus: result.panStatus === 'VALID' ? 'ACTIVE' : result.panStatus,
      isSandbox: isMock,
      submittedName: result.submittedName || name || null,
      submittedDob: result.submittedDob || dob || null,
      verifiedName: result.registeredName || null,
      verifiedDob: result.registeredDob || null,
      nameMatch: result.nameMatch,
      dobMatch: result.dobMatch,
      category: (result.details as any)?.category || 'Individual',
      fullName: result.registeredName || null,
      aadhaarSeedingStatus: result.aadhaarLinkStatus,
      verificationProvider: result.provider.toLowerCase(),
      traceId: result.details?.traceId || null,
      setuVerification: result.success ? 'success' : 'failed',
      verifiedAt: isVerified ? new Date(result.verifiedAt) : null,
    },
    update: {
      pan,
      panMasked: maskPan(pan),
      status: dbStatus as any,
      panStatus: result.panStatus === 'VALID' ? 'ACTIVE' : result.panStatus,
      isSandbox: isMock,
      submittedName: result.submittedName || name || null,
      submittedDob: result.submittedDob || dob || null,
      verifiedName: result.registeredName || null,
      verifiedDob: result.registeredDob || null,
      nameMatch: result.nameMatch,
      dobMatch: result.dobMatch,
      category: (result.details as any)?.category || 'Individual',
      fullName: result.registeredName || null,
      aadhaarSeedingStatus: result.aadhaarLinkStatus,
      verificationProvider: result.provider.toLowerCase(),
      traceId: result.details?.traceId || null,
      setuVerification: result.success ? 'success' : 'failed',
      verifiedAt: isVerified ? new Date(result.verifiedAt) : null,
    },
  });

  // Update workspace masked PAN
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { pan: maskPan(pan) },
  });

  // If verified, advance taxpayer profile onboarding step
  if (isVerified) {
    await prisma.taxpayerProfile.update({
      where: { id: profile.id },
      data: { onboardingStep: Math.max(profile.onboardingStep, 3) },
    });
  }

  // If verified and Aadhaar linkage is known, update AadhaarPanStatus
  if (isVerified && (result.aadhaarLinkStatus === 'LINKED' || result.aadhaarLinkStatus === 'NOT_LINKED')) {
    const mappedStatus = result.aadhaarLinkStatus === 'LINKED' ? 'LINKED' : 'NOT_LINKED';

    await prisma.aadhaarPanStatus.upsert({
      where: { taxpayerProfileId: profile.id },
      create: {
        taxpayerProfileId: profile.id,
        status: mappedStatus as any,
        isSandbox: isMock,
        providerReference: result.details?.traceId || null,
        checkedAt: new Date(),
      },
      update: {
        status: mappedStatus as any,
        isSandbox: isMock,
        providerReference: result.details?.traceId || null,
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

  // Return standardized unified response matching PanIdentityVerificationResult contract
  res.json(successResponse({
    success: result.success,
    verificationStatus: result.verificationStatus,
    panStatus: result.panStatus,
    nameMatch: result.nameMatch,
    dobMatch: result.dobMatch,
    aadhaarLinkStatus: result.aadhaarLinkStatus,
    registeredName: result.registeredName,
    registeredDob: result.registeredDob,
    submittedName: result.submittedName,
    submittedDob: result.submittedDob,
    maskedPan: result.maskedPan,
    provider: result.provider,
    message: result.message,
    testRecordId: result.testRecordId,
    isMockResponse: result.isMockResponse,
    verifiedAt: result.verifiedAt,
    details: result.details,
    // Backward-compatibility aliases for legacy callers:
    verification: result.success ? 'success' : 'failed',
    verificationProvider: result.provider.toLowerCase(),
    isSandbox: result.isMockResponse,
    traceId: result.details?.traceId,
    data: {
      pan: result.maskedPan,
      category: (result.details as any)?.category || 'Individual',
      fullName: result.registeredName,
      aadhaarSeedingStatus: result.aadhaarLinkStatus,
    },
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
 * POST /api/v1/individual/pan/classify-pattern
 * Experimental ML PAN verification pattern triage & risk classification.
 * Uses local ONNX Runtime inference (purely offline, non-destructive).
 */
export const classifyPanPatternHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const options: { modelPath?: string; simulateException?: boolean } = {};
  if (req.headers['x-simulate-exception'] === 'true' || req.body?.simulateException) {
    options.simulateException = true;
  }
  if (typeof req.headers['x-model-path'] === 'string') {
    options.modelPath = req.headers['x-model-path'];
  } else if (typeof req.body?.modelPath === 'string') {
    options.modelPath = req.body.modelPath;
  }

  const result = await PanPatternClassifierService.classify(req.body, options);
  res.json(successResponse(result));
});

/**
 * POST /api/v1/individual/pan/verify-identity
 * Deterministic Mock PAN Identity Matching (Field-by-field Name, DOB, PAN verification).
 * Unauthenticated for test bench and mock evaluation.
 */
export const verifyIdentityHandler = asyncHandler(async (req: any, res: Response) => {
  const { pan, name, dob, mobile, provider } = req.body || {};
  const result = await PanIdentityVerificationService.verifyIdentity({ pan, name, dob, mobile, provider });
  res.json(successResponse(result));
});

/**
 * GET /api/v1/individual/pan/mock-fixtures
 * Returns the 25 synthetic PAN identity testing records for development and testing.
 */
export const getMockFixturesHandler = asyncHandler(async (_req: any, res: Response) => {
  res.json(successResponse({
    total: SYNTHETIC_PAN_DATASET.length,
    fixtures: SYNTHETIC_PAN_DATASET,
    notice: 'Synthetic test fixtures. Hard mock-only boundary enforced: strictly blocked from Setu.',
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
    assessmentYear: 'TY 2026-27',
    eligibleITR,
    eligible: true,
    reasons,
    disqualifiers,
    note: 'Eligibility is preliminary and based on current income data. Final form selection may change as you add more information.',
  }));
});

/**
 * POST /api/v1/individual/tax/calculate
 * Deterministic rule-engine tax calculation using prediction orchestrator.
 */
export const calculateTaxHandler = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  // Fetch the most recent tax return
  let taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  if (!taxReturn) {
    taxReturn = await prisma.taxReturn.create({
      data: {
        workspaceId,
        financialYear: '2025-26',
        assessmentYear: 'AY 2026-27',
        returnType: 'ITR1',
        regime: 'NEW',
        metadata: {
          framework: 'IT_ACT_1961',
          yearType: 'ASSESSMENT_YEAR',
          canonicalYear: 'AY 2026-27',
          ruleVersion: 'AY2026-27-v1',
        },
      },
    });
  } else if (
    (taxReturn.assessmentYear === '2026-27' || taxReturn.assessmentYear === '2026-2027') &&
    !(taxReturn.metadata as any)?.framework
  ) {
    taxReturn = await prisma.taxReturn.update({
      where: { id: taxReturn.id },
      data: {
        assessmentYear: 'AY 2026-27',
        metadata: {
          ...((taxReturn.metadata as any) || {}),
          framework: 'IT_ACT_1961',
          yearType: 'ASSESSMENT_YEAR',
          canonicalYear: 'AY 2026-27',
          ruleVersion: 'AY2026-27-v1',
        },
      },
    });
  }

  // Call Orchestrator
  const { generateTaxPrediction } = await import('../modules/taxPrediction/prediction.service');
  const predictionResult = await generateTaxPrediction(taxReturn.id, req.user!.userId);

  const [incomeCount, deductionCount] = await Promise.all([
    prisma.incomeEntry.count({ where: { taxReturnId: taxReturn.id } }),
    prisma.deduction.count({ where: { taxReturnId: taxReturn.id } }),
  ]);

  res.json(successResponse({
    comparison: {
      assessmentYear: predictionResult.regimes.assessmentYear,
      ruleVersion: predictionResult.regimes.ruleVersion,
      newRegime: predictionResult.regimes.new,
      oldRegime: predictionResult.regimes.old,
      savings: Number(predictionResult.regimes.saving),
      recommendedRegime: predictionResult.regimes.recommendation,
      savingsExplanation: `Choosing the ${predictionResult.regimes.recommendation} regime saves you ₹${Number(predictionResult.regimes.saving).toLocaleString('en-IN')}`
    },
    inputSummary: { 
      grossIncome: Number(predictionResult.prediction.grossIncome), 
      tdsDeducted: Number(predictionResult.prediction.tdsDeducted), 
      incomeCount, 
      deductionCount,
    },
    prediction: predictionResult.prediction,
    optimizations: predictionResult.optimizations,
    deductionEvaluation: predictionResult.deductionEvaluation,
    issues: predictionResult.issues,
    confidence: predictionResult.confidence,
    readiness: predictionResult.readiness,
    note: `Tax calculated by TaxPilot prediction engine for ${predictionResult.regimes.assessmentYear || 'Tax Year 2026-27'}. Final liability must be confirmed on the Income Tax portal.`,
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
 * User reviews and approves — enforces validation & calculation checks before setting APPROVED
 */
export const approveReturn = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const workspaceId = await getWorkspaceForUser(req.user!.userId);

  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { incomeEntries: true, deductions: true },
  });

  if (!taxReturn) return next(new AppError('No tax return found to approve', 404, 'NOT_FOUND'));

  const lockedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'];
  if (lockedStates.includes(taxReturn.status)) {
    return next(new AppError(`Cannot approve return in locked status: ${taxReturn.status}`, 403, 'LOCKED_RETURN'));
  }

  // 1. Validation checks
  const profile = await prisma.taxpayerProfile.findUnique({
    where: { workspaceId },
    include: { panVerification: true },
  });

  if (!profile?.panVerification || !['VERIFIED', 'SANDBOX'].includes(profile.panVerification.status)) {
    return next(new AppError('PAN verification is required before approval.', 422, 'PAN_NOT_VERIFIED'));
  }

  if (!profile?.fullName || !profile?.dateOfBirth) {
    return next(new AppError('Full name and date of birth are required before approval.', 422, 'PROFILE_INCOMPLETE'));
  }

  if (taxReturn.incomeEntries.length === 0) {
    return next(new AppError('At least one income source must be added before approval.', 422, 'NO_INCOME'));
  }

  // 2. Calculation freshness & atomic approval transaction
  const ip = getClientIp(req);
  const timestamp = new Date().toISOString();

  const [approval, updated] = await prisma.$transaction(async (tx) => {
    // Acquire row-level lock on TaxReturn to serialize concurrent operations
    if (typeof tx?.$queryRaw === 'function') {
      await tx.$queryRaw`SELECT id FROM "TaxReturn" WHERE id = ${taxReturn.id} FOR UPDATE`;
    }

    // Re-fetch tax return within transaction to prevent race conditions
    const currentReturn = await tx.taxReturn.findUnique({
      where: { id: taxReturn.id },
      include: { incomeEntries: true, deductions: true },
    });

    if (!currentReturn) throw new AppError('Tax return not found', 404, 'NOT_FOUND');
    if (lockedStates.includes(currentReturn.status)) {
      throw new AppError(`Cannot approve return in locked status: ${currentReturn.status}`, 403, 'LOCKED_RETURN');
    }
    if (currentReturn.status === 'APPROVED') {
      throw new AppError('Tax return has already been approved', 409, 'ALREADY_APPROVED');
    }

    const calculation = await tx.taxCalculation.findFirst({
      where: { taxReturnId: currentReturn.id },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!calculation) {
      throw new AppError('Tax calculation is required before approving return. Please calculate tax first.', 422, 'NO_CALCULATION');
    }

    if (calculation.regime !== currentReturn.regime) {
      throw new AppError(`Tax calculation regime (${calculation.regime}) does not match current return regime (${currentReturn.regime}). Recalculate tax before approval.`, 422, 'STALE_CALCULATION');
    }

    const inputs = calculation.inputs as any;
    if (
      inputs?.incomeCount !== currentReturn.incomeEntries.length ||
      inputs?.deductionCount !== currentReturn.deductions.length
    ) {
      throw new AppError('Tax calculation is stale relative to current income or deduction entries. Recalculate tax before approval.', 422, 'STALE_CALCULATION');
    }

    const snapshot: CanonicalFinancialSnapshot = {
      taxReturnId: currentReturn.id,
      userId: req.user!.userId,
      assessmentYear: currentReturn.assessmentYear,
      regime: currentReturn.regime,
      ruleVersion: calculation.ruleVersion,
      grossIncome: Number(calculation.grossIncome),
      totalDeductions: Number(calculation.totalDeductions),
      taxableIncome: Number(calculation.taxableIncome),
      taxLiability: Number(calculation.taxLiability),
      totalTax: Number(calculation.totalTax),
      tdsDeducted: Number(calculation.tdsDeducted),
      refundPayable: Number(calculation.refundPayable),
      calculationId: calculation.id,
      timestamp,
    };

    const approvalHash = generateApprovalHash(snapshot);
    const notesPayload = JSON.stringify({
      note: 'Individual approval via TaxPilot review',
      snapshot,
    });

    // Supersede any existing ACTIVE approval for audit traceability
    if (typeof tx?.approval?.updateMany === 'function') {
      await tx.approval.updateMany({
        where: { taxReturnId: currentReturn.id, status: 'ACTIVE' },
        data: {
          status: 'SUPERSEDED',
          invalidatedAt: new Date(),
          invalidationReason: 'Superseded by new approval',
        },
      });
    }

    const approvalRecord = await tx.approval.create({
      data: {
        taxReturnId: currentReturn.id,
        approvedBy: req.user!.userId,
        ipAddress: ip,
        approvalHash,
        notes: notesPayload,
        status: 'ACTIVE',
      },
    });

    const updatedRet = await tx.taxReturn.update({
      where: { id: currentReturn.id },
      data: { status: 'APPROVED' },
    });

    return [approvalRecord, updatedRet];
  });

  res.json(successResponse({
    message: 'Return approved and marked as ready for submission.',
    status: updated.status,
    returnId: updated.id,
    approvalHash: approval.approvalHash,
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
