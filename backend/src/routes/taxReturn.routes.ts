import { Router } from 'express';
import * as ctrl from '../controllers/taxReturn.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { taxReturnSchema, incomeSchema, deductionSchema, issueUpdateSchema } from '../validators';

const router = Router();
router.use(authenticate);

// Tax Returns (scoped under workspace)
router.get('/workspaces/:workspaceId/tax-returns', ctrl.getTaxReturns);
router.post('/workspaces/:workspaceId/tax-returns', validate(taxReturnSchema), ctrl.createTaxReturn);
router.get('/tax-returns/:returnId', ctrl.getTaxReturn);
router.patch('/tax-returns/:returnId', ctrl.updateTaxReturn);

// Income
router.get('/tax-returns/:returnId/income', ctrl.getIncome);
router.post('/tax-returns/:returnId/income', validate(incomeSchema), ctrl.addIncome);
router.patch('/income/:incomeId', ctrl.updateIncome);
router.delete('/income/:incomeId', ctrl.deleteIncome);

// Deductions
router.get('/tax-returns/:returnId/deductions', ctrl.getDeductions);
router.post('/tax-returns/:returnId/deductions', validate(deductionSchema), ctrl.addDeduction);
router.patch('/deductions/:deductionId', ctrl.updateDeduction);
router.delete('/deductions/:deductionId', ctrl.deleteDeduction);

// Tax Engine
router.post('/tax-returns/:returnId/calculate', ctrl.calculate);
router.get('/tax-returns/:returnId/calculation', ctrl.getCalculationResult);
router.post('/tax-returns/:returnId/compare-regimes', ctrl.compareRegimesController);

// Validation
router.post('/tax-returns/:returnId/validate', ctrl.validate);
router.get('/tax-returns/:returnId/validation', ctrl.getValidation);
router.get('/tax-returns/:returnId/issues', ctrl.getIssuesController);
router.patch('/issues/:issueId', validate(issueUpdateSchema), ctrl.updateIssueController);
router.post('/issues/:issueId/resolve', ctrl.resolveIssueController);

// Tax Savings
router.get('/tax-returns/:returnId/tax-savings', ctrl.getTaxSavingsController);
router.post('/tax-returns/:returnId/tax-savings/recalculate', ctrl.getTaxSavingsController);

// Review / Approval
router.get('/tax-returns/:returnId/review', ctrl.getReviewController);
router.post('/tax-returns/:returnId/review', ctrl.createReviewController);
router.post('/tax-returns/:returnId/approve', ctrl.approveController);

export default router;
