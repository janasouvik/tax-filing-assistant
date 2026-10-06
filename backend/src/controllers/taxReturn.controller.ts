import { Response } from 'express';
import * as taxReturnService from '../services/taxReturn.service';
import { successResponse, asyncHandler } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { calculateTax, getCalculation, compareRegimes } from '../modules/taxEngine/taxEngine.service';
import { runValidation, getValidationResult, getIssues, updateIssue, resolveIssue } from '../modules/validation/validation.service';
import { getTaxSavings } from '../modules/taxSavings/taxSavings.service';
import { getReview, createReview, approveReturn } from '../modules/review/review.service';
import { getClientIp } from '../utils/helpers';

// Tax Returns
export const getTaxReturns = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.getTaxReturns((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const createTaxReturn = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.createTaxReturn((req.params.workspaceId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const getTaxReturn = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.getTaxReturn((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const updateTaxReturn = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.updateTaxReturn((req.params.returnId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

// Income
export const getIncome = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.getIncome((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const addIncome = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.addIncome((req.params.returnId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const updateIncome = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.updateIncome((req.params.incomeId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

export const deleteIncome = asyncHandler(async (req: AuthRequest, res: Response) => {
  await taxReturnService.deleteIncome((req.params.incomeId as string), req.user!.userId);
  res.json(successResponse({ message: 'Deleted' }));
});

// Deductions
export const getDeductions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.getDeductions((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const addDeduction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.addDeduction((req.params.returnId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const updateDeduction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await taxReturnService.updateDeduction((req.params.deductionId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

export const deleteDeduction = asyncHandler(async (req: AuthRequest, res: Response) => {
  await taxReturnService.deleteDeduction((req.params.deductionId as string), req.user!.userId);
  res.json(successResponse({ message: 'Deleted' }));
});

// Tax Engine
export const calculate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await calculateTax((req.params.returnId as string), req.user!.userId, req.body.regime);
  res.json(successResponse(data));
});

export const getCalculationResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getCalculation((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const compareRegimesController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await compareRegimes((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

// Validation
export const validate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await runValidation((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const getValidation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getValidationResult((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const getIssuesController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getIssues((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const updateIssueController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await updateIssue((req.params.issueId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

export const resolveIssueController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await resolveIssue((req.params.issueId as string), req.user!.userId);
  res.json(successResponse(data));
});

// Tax Savings
export const getTaxSavingsController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getTaxSavings((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

// Review/Approval
export const getReviewController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getReview((req.params.returnId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const createReviewController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await createReview((req.params.returnId as string), req.user!.userId, req.body.notes);
  res.status(201).json(successResponse(data));
});

export const approveController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ip = getClientIp(req);
  const data = await approveReturn((req.params.returnId as string), req.user!.userId, ip, req.body.notes);
  res.json(successResponse(data));
});
