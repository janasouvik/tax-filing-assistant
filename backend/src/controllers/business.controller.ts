import { Response } from 'express';
import * as businessService from '../services/business.service';
import { successResponse, asyncHandler } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const getBusinesses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.getBusinesses((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const createBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.createBusiness((req.params.workspaceId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const getBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.getBusiness((req.params.businessId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const updateBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.updateBusiness((req.params.businessId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

export const deleteBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
  await businessService.deleteBusiness((req.params.businessId as string), req.user!.userId);
  res.json(successResponse({ message: 'Deleted' }));
});

export const getFinancialSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.getFinancialSummary((req.params.businessId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const getExpenses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.getExpenses((req.params.businessId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const addExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.addExpense((req.params.businessId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const updateExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.updateExpense((req.params.expenseId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

export const deleteExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  await businessService.deleteExpense((req.params.expenseId as string), req.user!.userId);
  res.json(successResponse({ message: 'Deleted' }));
});

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.getTransactions((req.params.businessId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const addTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await businessService.addTransaction((req.params.businessId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});
