import { Router } from 'express';
import { authenticate, loadUser } from '../middlewares/auth';
import rateLimit from 'express-rate-limit';
import {
  getProfile,
  updateProfile,
  verifyPanHandler,
  getPanStatus,
  checkAadhaarPanStatusHandler,
  getVerificationStatus,
  checkEligibility,
  calculateTaxHandler,
  validateReturn,
  approveReturn,
  getReturnStatus,
} from '../controllers/individual.controller';

const router = Router();

// All individual routes require authentication
router.use(authenticate, loadUser);

// Stricter rate limit for verification endpoints (security)
const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many verification attempts. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Personal Profile
router.get('/individual/profile', getProfile);
router.put('/individual/profile', updateProfile);

// PAN Verification
router.post('/individual/pan/verify', verificationRateLimit, verifyPanHandler);
router.get('/individual/pan/status', getPanStatus);

// Aadhaar-PAN Link Status
router.post('/individual/aadhaar-pan/status', verificationRateLimit, checkAadhaarPanStatusHandler);

// Combined verification status
router.get('/individual/verification-status', getVerificationStatus);

// ITR Eligibility
router.post('/individual/eligibility/check', checkEligibility);

// Tax Calculation (rule engine — not LLM)
router.post('/individual/tax/calculate', calculateTaxHandler);

// Validation Engine
router.post('/individual/validate', validateReturn);

// Return Approval and Status
router.post('/individual/return/approve', approveReturn);
router.get('/individual/return/status', getReturnStatus);

export default router;

