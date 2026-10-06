import { Router } from 'express';
import * as ctrl from '../controllers/business.controller';
import { authenticate, loadUser } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { businessSchema, expenseSchema, transactionSchema } from '../validators';

const router = Router();
router.use(authenticate, loadUser);

router.get('/workspaces/:workspaceId/businesses', ctrl.getBusinesses);
router.post('/workspaces/:workspaceId/businesses', validate(businessSchema), ctrl.createBusiness);
router.get('/businesses/:businessId', ctrl.getBusiness);
router.patch('/businesses/:businessId', ctrl.updateBusiness);
router.delete('/businesses/:businessId', ctrl.deleteBusiness);

router.get('/businesses/:businessId/financial-summary', ctrl.getFinancialSummary);

router.get('/businesses/:businessId/expenses', ctrl.getExpenses);
router.post('/businesses/:businessId/expenses', validate(expenseSchema), ctrl.addExpense);
router.patch('/expenses/:expenseId', ctrl.updateExpense);
router.delete('/expenses/:expenseId', ctrl.deleteExpense);

router.get('/businesses/:businessId/transactions', ctrl.getTransactions);
router.post('/businesses/:businessId/transactions', validate(transactionSchema), ctrl.addTransaction);

export default router;
