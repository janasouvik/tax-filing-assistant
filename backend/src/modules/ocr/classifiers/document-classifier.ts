import { DocumentCategoryType } from '../types';

export interface ClassificationResult {
  category: DocumentCategoryType;
  confidence: number;
  clues: string[];
}

export class DocumentClassifier {
  /**
   * Classifies a document based on its extracted text.
   */
  public static classify(text: string): ClassificationResult {
    const lower = text.toLowerCase();
    const clues: string[] = [];

    // --- 1. Form 16 Check ---
    let form16Score = 0;
    if (/form\s+(no\.?\s*)?16\b/i.test(text)) {
      form16Score += 40;
      clues.push('Contains "Form 16" title');
    }
    if (/certificate\s+under\s+section\s+203/i.test(text)) {
      form16Score += 30;
      clues.push('Mentions "Certificate under section 203"');
    }
    if (/(part\s+a\b.*part\s+b\b)|(part\s+a\b)/i.test(text)) {
      form16Score += 15;
      clues.push('Contains Form 16 Part A/B structure');
    }
    if (/deductions?\s+under\s+chapter\s+vi-?a/i.test(text)) {
      form16Score += 15;
      clues.push('Contains Chapter VI-A deductions schedule');
    }
    if (/quarterly\s+statements?\s+of\s+tds/i.test(text) || /tax\s+deducted\s+at\s+source/i.test(text)) {
      form16Score += 10;
      clues.push('Contains TDS summary table');
    }
    if (form16Score >= 50) {
      return {
        category: 'FORM_16',
        confidence: Math.min(1.0, form16Score / 100),
        clues,
      };
    }

    // --- 2. Salary Slip Check ---
    let slipScore = 0;
    if (/\b(payslip|pay\s+slip|salary\s+slip)\b/i.test(text)) {
      slipScore += 40;
      clues.push('Contains "Payslip" / "Salary Slip" header');
    }
    if (/\b(earnings|allowances)\b/i.test(lower) && /\b(deductions)\b/i.test(lower)) {
      slipScore += 25;
      clues.push('Contains Earnings and Deductions breakdown');
    }
    if (/\b(basic\s+salary|basic\s+pay|hra|house\s+rent\s+allowance)\b/i.test(lower)) {
      slipScore += 20;
      clues.push('Contains standard salary components (Basic/HRA)');
    }
    if (/\b(net\s+pay|net\s+salary|take\s+home)\b/i.test(lower)) {
      slipScore += 15;
      clues.push('Contains Net Pay line');
    }
    if (slipScore >= 50) {
      return {
        category: 'SALARY_SLIP',
        confidence: Math.min(1.0, slipScore / 100),
        clues,
      };
    }

    // --- 3. Bank Statement Check ---
    let bankScore = 0;
    if (/statement\s+of\s+account/i.test(text) || /account\s+statement/i.test(text)) {
      bankScore += 35;
      clues.push('Contains Account Statement header');
    }
    if (/\b(ifsc|micr|a\/c\s+no|account\s+number)\b/i.test(lower)) {
      bankScore += 25;
      clues.push('Contains banking identifiers (IFSC/Account No)');
    }
    if (/\b(withdrawal|deposit|debit|credit|balance)\b/i.test(lower)) {
      bankScore += 20;
      clues.push('Contains ledger transaction columns');
    }
    if (/\b(opening\s+balance|closing\s+balance)\b/i.test(lower)) {
      bankScore += 20;
      clues.push('Contains Opening/Closing balance lines');
    }
    if (bankScore >= 50) {
      return {
        category: 'BANK_STATEMENT',
        confidence: Math.min(1.0, bankScore / 100),
        clues,
      };
    }

    // --- 4. Investment Proof Check ---
    let investScore = 0;
    if (/\b(insurance|life\s+insurance|lic|elss|provident\s+fund|ppf|pension|policy)\b/i.test(lower)) {
      investScore += 25;
      clues.push('Contains investment or insurance keywords');
    }
    if (/premium\s+receipt|policy\s+no|premium\s+paid/i.test(text)) {
      investScore += 30;
      clues.push('Contains insurance premium or policy details');
    }
    if (/section\s+80c|section\s+80d|sec\s+80c|sec\s+80d/i.test(text)) {
      investScore += 35;
      clues.push('Cites specific Chapter VI-A sections (80C/80D)');
    }
    if (/national\s+pension\s+system|pran|tier\s+i/i.test(lower)) {
      investScore += 35;
      clues.push('Contains NPS/PRAN details');
    }
    if (investScore >= 50) {
      return {
        category: 'INVESTMENT_PROOF',
        confidence: Math.min(1.0, investScore / 100),
        clues,
      };
    }

    return {
      category: 'OTHER',
      confidence: 0.3,
      clues: ['No strong fiscal document markers matched'],
    };
  }
}
