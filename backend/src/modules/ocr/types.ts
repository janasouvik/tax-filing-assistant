export type DocumentCategoryType =
  | 'FORM_16'
  | 'FORM_16A'
  | 'FORM_26AS'
  | 'AIS'
  | 'BANK_STATEMENT'
  | 'INVESTMENT_PROOF'
  | 'RENT_RECEIPT'
  | 'INSURANCE_PREMIUM'
  | 'CAPITAL_GAINS'
  | 'BUSINESS_INCOME'
  | 'SALARY_SLIP'
  | 'INVOICE'
  | 'EXPENSE_RECEIPT'
  | 'OTHER';

export type DocumentProcessingStep =
  | 'QUEUED'
  | 'UPLOADING'
  | 'READING_PDF'
  | 'PREPROCESSING_IMAGE'
  | 'RUNNING_OCR'
  | 'CLASSIFYING'
  | 'EXTRACTING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED';

export interface ExtractedFieldResult {
  id?: string;
  fieldName: string;
  fieldLabel: string;
  category: 'EMPLOYER' | 'EMPLOYEE' | 'SALARY' | 'DEDUCTION' | 'TAX' | 'BANK' | 'GENERAL';
  rawValue: string | null;
  normalizedValue: string | number | null;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  confidence: number; // 0.0 - 1.0
  pageNumber: number;
  isVerified: boolean;
  userCorrected?: boolean;
  warning?: string | null;
  sourceTextSnippet?: string | null;
}

export interface ValidationWarning {
  code: string;
  field?: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

export interface ExtractedPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  isScanned: boolean;
}

export interface BankTransactionItem {
  date: string;
  description: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  runningBalance?: number;
  reference?: string;
}

export interface Form16NormalizedData {
  employerName: string | null;
  employerTan: string | null;
  employerPan: string | null;
  employerAddress: string | null;
  employeeName: string | null;
  employeePan: string | null;
  financialYear: string | null;
  assessmentYear: string | null;
  grossSalary: number | null;
  exemptAllowances: number | null;
  standardDeduction: number | null;
  professionalTax: number | null;
  netTaxableSalary: number | null;
  deductions80C: number | null;
  deductions80CCD1B: number | null;
  deductions80CCD2: number | null;
  deductions80D: number | null;
  totalDeductionsChapterVIA: number | null;
  totalTaxableIncome: number | null;
  taxPayable: number | null;
  tdsDeducted: number | null;
  tdsDeposited: number | null;
}

export interface DocumentExtractionResult {
  documentId: string;
  category: DocumentCategoryType;
  detectedCategory: DocumentCategoryType;
  classificationConfidence: number;
  pages: ExtractedPageResult[];
  fields: ExtractedFieldResult[];
  structuredData: Record<string, any>;
  validationWarnings: ValidationWarning[];
  summary: {
    totalFields: number;
    highConfidenceFields: number;
    lowConfidenceFields: number;
    needsUserReview: boolean;
  };
}

export interface OcrProcessingOptions {
  forceOcr?: boolean;
  maxPages?: number;
  timeoutMs?: number;
}

