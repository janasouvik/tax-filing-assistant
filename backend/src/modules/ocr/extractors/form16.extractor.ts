import { ExtractedFieldResult, Form16NormalizedData, ValidationWarning } from '../types';

export interface Form16ParseResult {
  fields: ExtractedFieldResult[];
  normalized: Form16NormalizedData;
  warnings: ValidationWarning[];
}

export class Form16Extractor {
  /**
   * Parses Form 16 text (Part A and Part B).
   */
  public static extract(text: string, pages: Array<{ pageNumber: number; text: string }>): Form16ParseResult {
    const fields: ExtractedFieldResult[] = [];
    const warnings: ValidationWarning[] = [];

    // Helper to find which page a match belongs to
    const findPageForMatch = (snippet: string): number => {
      for (const p of pages) {
        if (p.text.includes(snippet.slice(0, Math.min(snippet.length, 30)))) {
          return p.pageNumber;
        }
      }
      return 1;
    };

    // Helper to parse numbers safely
    const parseCurrency = (str?: string | null): number | null => {
      if (!str) return null;
      const cleaned = str.replace(/[₹Rs\.,\s/-]/g, (match, offset, full) => {
        if (match === '.' && offset === full.lastIndexOf('.')) return '.';
        return '';
      }).trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : Math.round(num * 100) / 100;
    };

    // ── 1. EMPLOYEE & EMPLOYER IDENTIFIERS ──

    // PAN of Employee
    let employeePan: string | null = null;
    let employeePanSnippet: string | null = null;
    const empPanMatches = text.match(/(?:PAN\s+of\s+the\s+Employee|Employee\s+PAN|PAN\s+of\s+Employee)[\s:.-]*([A-Z]{5}[0-9]{4}[A-Z])/i) ||
                          text.match(/([A-Z]{5}[0-9]{4}[A-Z])[\s\S]{0,30}?(?:Employee|Assessee)/i);
    if (empPanMatches) {
      employeePan = empPanMatches[1].toUpperCase();
      employeePanSnippet = empPanMatches[0];
    } else {
      // Fallback: look for PAN patterns in document
      const allPans = Array.from(text.matchAll(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/g)).map(m => m[1].toUpperCase());
      if (allPans.length >= 2) {
        // In standard Form 16, employer PAN is usually first, employee PAN is second
        employeePan = allPans[1];
        employeePanSnippet = `PAN: ${employeePan}`;
      } else if (allPans.length === 1) {
        employeePan = allPans[0];
        employeePanSnippet = `PAN: ${employeePan}`;
      }
    }

    // Employer TAN
    let employerTan: string | null = null;
    let employerTanSnippet: string | null = null;
    const tanMatch = text.match(/(?:TAN\s+of\s+the\s+Deductor|Employer\s+TAN|TAN)[\s:.-]*([A-Z]{4}[0-9]{5}[A-Z])/i) ||
                     text.match(/\b([A-Z]{4}[0-9]{5}[A-Z])\b/);
    if (tanMatch) {
      employerTan = tanMatch[1].toUpperCase();
      employerTanSnippet = tanMatch[0];
    }

    // Employer PAN
    let employerPan: string | null = null;
    const empDeductorPanMatch = text.match(/(?:PAN\s+of\s+the\s+Deductor|Employer\s+PAN)[\s:.-]*([A-Z]{5}[0-9]{4}[A-Z])/i);
    if (empDeductorPanMatch) {
      employerPan = empDeductorPanMatch[1].toUpperCase();
    }

    // Employer Name
    let employerName: string | null = null;
    let employerNameSnippet: string | null = null;
    const employerNameMatch = text.match(/(?:Name\s+and\s+address\s+of\s+the\s+Employer|Name\s+of\s+Employer|Employer\s+Name)[\s:.-]+([^\n\r,]{3,60})/i) ||
                              text.match(/(?:Deductor\s+Name)[\s:.-]+([^\n\r,]{3,60})/i);
    if (employerNameMatch) {
      employerName = employerNameMatch[1].trim();
      employerNameSnippet = employerNameMatch[0];
    }

    // Employee Name
    let employeeName: string | null = null;
    let employeeNameSnippet: string | null = null;
    const employeeNameMatch = text.match(/(?:Name\s+and\s+address\s+of\s+the\s+Employee|Name\s+of\s+Employee|Employee\s+Name)[\s:.-]+([^\n\r,]{3,60})/i);
    if (employeeNameMatch) {
      employeeName = employeeNameMatch[1].trim();
      employeeNameSnippet = employeeNameMatch[0];
    }

    // Assessment Year & Financial Year
    let assessmentYear: string | null = null;
    let financialYear: string | null = null;
    const ayMatch = text.match(/(?:Assessment\s+Year|A\.?Y\.?)[\s:.-]*([0-9]{4}\s*[-–/]\s*[0-9]{2,4})/i);
    if (ayMatch) {
      assessmentYear = ayMatch[1].replace(/\s+/g, '');
    }
    const fyMatch = text.match(/(?:Financial\s+Year|Period\s+with\s+the\s+Employer|F\.?Y\.?)[\s:.-]*([0-9]{4}\s*[-–/]\s*[0-9]{2,4})/i);
    if (fyMatch) {
      financialYear = fyMatch[1].replace(/\s+/g, '');
    }

    // If only AY found, deduce FY
    if (assessmentYear && !financialYear) {
      const startYear = parseInt(assessmentYear.slice(0, 4), 10);
      if (!isNaN(startYear)) {
        financialYear = `${startYear - 1}-${(startYear).toString().slice(2)}`;
      }
    }
    // If only FY found, deduce AY
    if (financialYear && !assessmentYear) {
      const startYear = parseInt(financialYear.slice(0, 4), 10);
      if (!isNaN(startYear)) {
        assessmentYear = `${startYear + 1}-${(startYear + 2).toString().slice(2)}`;
      }
    }

    // ── 2. SALARY COMPONENTS (PART B) ──

    // Gross Salary (Section 17(1) + 17(2) + 17(3))
    let grossSalary: number | null = null;
    let grossSalarySnippet: string | null = null;
    const grossMatch = text.match(/(?:Gross\s+Salary|Gross\s+Total\s+Salary|Salary\s+as\s+per\s+provisions\s+contained\s+in\s+sec(?:tion)?\.?\s*17\(1\))[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i) ||
                       text.match(/(?:Total\s+Gross\s+Salary)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (grossMatch) {
      grossSalary = parseCurrency(grossMatch[1]);
      grossSalarySnippet = grossMatch[0];
    }

    // Exempt Allowances under Section 10 (HRA, LTA, etc.)
    let exemptAllowances: number | null = null;
    const exemptMatch = text.match(/(?:Total\s+amount\s+of\s+any\s+other\s+exemption\s+under\s+section\s+10|Allowances\s+exempt\s+u\/s\s*10|Exempt\s+allowances)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (exemptMatch) {
      exemptAllowances = parseCurrency(exemptMatch[1]);
    }

    // Standard Deduction under Section 16(ia)
    let standardDeduction: number | null = null;
    let standardDeductionSnippet: string | null = null;
    const stdMatch = text.match(/(?:Standard\s+deduction\s+under\s+section\s*16\(ia\)|Standard\s+Deduction)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (stdMatch) {
      standardDeduction = parseCurrency(stdMatch[1]);
      standardDeductionSnippet = stdMatch[0];
    } else if (grossSalary && grossSalary > 300000) {
      // Default statutory standard deduction for salaried individuals
      standardDeduction = 50000;
    }

    // Professional Tax under Section 16(iii)
    let professionalTax: number | null = null;
    const ptMatch = text.match(/(?:Tax\s+on\s+employment\s+under\s+section\s*16\(iii\)|Professional\s+Tax)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (ptMatch) {
      professionalTax = parseCurrency(ptMatch[1]);
    }

    // Income Chargeable under the head 'Salaries'
    let netTaxableSalary: number | null = null;
    let netSalarySnippet: string | null = null;
    const netSalMatch = text.match(/(?:Income\s+chargeable\s+under\s+the\s+head\s+['"]?Salaries['"]?|Income\s+from\s+Salaries|Net\s+Salary)[^\n\r:]{0,40}[:.-]+\s*(?:Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)/i) ||
                        text.match(/(?:Income\s+chargeable\s+under\s+the\s+head\s+['"]?Salaries['"]?|Income\s+from\s+Salaries|Net\s+Salary)\s*[:.-]+\s*(?:Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)/i);
    if (netSalMatch) {
      netTaxableSalary = parseCurrency(netSalMatch[1]);
      netSalarySnippet = netSalMatch[0];
    } else if (grossSalary != null) {
      const deductions = (standardDeduction || 0) + (professionalTax || 0) + (exemptAllowances || 0);
      netTaxableSalary = Math.max(0, grossSalary - deductions);
    }

    // ── 3. DEDUCTIONS UNDER CHAPTER VI-A ──

    // Section 80C
    let deductions80C: number | null = null;
    let deductions80CSnippet: string | null = null;
    const d80cMatch = text.match(/(?:Section\s+80C|Sec\.?\s*80C\b)[^\n\r0-9]{0,35}(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (d80cMatch) {
      deductions80C = Math.min(150000, parseCurrency(d80cMatch[1]) || 0);
      deductions80CSnippet = d80cMatch[0];
    }

    // Section 80CCD(1B) (NPS)
    let deductions80CCD1B: number | null = null;
    const d80ccdMatch = text.match(/(?:Section\s+80CCD\(1B\)|Sec\.?\s*80CCD\(1B\))[^\n\r0-9]{0,35}(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (d80ccdMatch) {
      deductions80CCD1B = Math.min(50000, parseCurrency(d80ccdMatch[1]) || 0);
    }

    // Section 80CCD(2) (Employer NPS)
    let deductions80CCD2: number | null = null;
    const d80ccd2Match = text.match(/(?:Section\s+80CCD\(2\)|Sec\.?\s*80CCD\(2\))[^\n\r0-9]{0,35}(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (d80ccd2Match) {
      deductions80CCD2 = parseCurrency(d80ccd2Match[1]);
    }

    // Section 80D (Health Insurance)
    let deductions80D: number | null = null;
    const d80dMatch = text.match(/(?:Section\s+80D|Sec\.?\s*80D\b)[^\n\r0-9]{0,35}(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (d80dMatch) {
      deductions80D = parseCurrency(d80dMatch[1]);
    }

    // Total Chapter VI-A Deductions
    let totalDeductionsChapterVIA: number | null = null;
    const totalDedMatch = text.match(/(?:Total\s+deductible\s+amount\s+under\s+Chapter\s+VI-?A|Aggregate\s+of\s+deductible\s+amount\s+under\s+Chapter\s+VI-?A)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (totalDedMatch) {
      totalDeductionsChapterVIA = parseCurrency(totalDedMatch[1]);
    } else {
      totalDeductionsChapterVIA = (deductions80C || 0) + (deductions80CCD1B || 0) + (deductions80CCD2 || 0) + (deductions80D || 0);
      if (totalDeductionsChapterVIA === 0) totalDeductionsChapterVIA = null;
    }

    // Total Taxable Income
    let totalTaxableIncome: number | null = null;
    const taxableMatch = text.match(/(?:Total\s+taxable\s+income|Total\s+Income\s*\(rounded\s+off\)|Total\s+Income)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (taxableMatch) {
      totalTaxableIncome = parseCurrency(taxableMatch[1]);
    } else if (netTaxableSalary != null) {
      totalTaxableIncome = Math.max(0, netTaxableSalary - (totalDeductionsChapterVIA || 0));
    }

    // ── 4. TDS AND TAX PAYABLE ──

    // Total Tax Deducted (TDS)
    let tdsDeducted: number | null = null;
    let tdsSnippet: string | null = null;
    const tdsMatch = text.match(/(?:Total\s+Tax\s+Deducted|Tax\s+deducted\s+at\s+source|Total\s+TDS)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i) ||
                     text.match(/(?:Net\s+tax\s+payable\s+or\s+refundable|Tax\s+payable)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (tdsMatch) {
      tdsDeducted = parseCurrency(tdsMatch[1]);
      tdsSnippet = tdsMatch[0];
    }

    // Total Tax Deposited
    let tdsDeposited: number | null = null;
    const depositedMatch = text.match(/(?:Total\s+tax\s+deposited|Total\s+deposited|Amount\s+deposited\s+in\s+respect\s+of\s+tax)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (depositedMatch) {
      tdsDeposited = parseCurrency(depositedMatch[1]);
    } else {
      tdsDeposited = tdsDeducted;
    }

    // ── 5. ASSEMBLE EXTRACTED FIELD RESULTS ──

    const addField = (
      name: string,
      label: string,
      category: 'EMPLOYER' | 'EMPLOYEE' | 'SALARY' | 'DEDUCTION' | 'TAX' | 'GENERAL',
      raw: string | null,
      normalized: string | number | null,
      dataType: 'string' | 'number' | 'date',
      confidence: number,
      snippet?: string | null,
      warning?: string | null
    ) => {
      fields.push({
        fieldName: name,
        fieldLabel: label,
        category,
        rawValue: raw,
        normalizedValue: normalized,
        dataType,
        confidence,
        pageNumber: snippet ? findPageForMatch(snippet) : 1,
        isVerified: false,
        sourceTextSnippet: snippet || null,
        warning: warning || null,
      });
    };

    // Employer Fields
    addField('employerName', 'Employer Name', 'EMPLOYER', employerName, employerName, 'string', employerName ? 0.95 : 0.4, employerNameSnippet);
    addField('employerTan', 'Employer TAN', 'EMPLOYER', employerTan, employerTan, 'string', employerTan ? 0.98 : 0.3, employerTanSnippet);
    if (employerPan) addField('employerPan', 'Employer PAN', 'EMPLOYER', employerPan, employerPan, 'string', 0.95);

    // Employee Fields
    addField('employeeName', 'Employee Name', 'EMPLOYEE', employeeName, employeeName, 'string', employeeName ? 0.95 : 0.4, employeeNameSnippet);
    addField('employeePan', 'Employee PAN', 'EMPLOYEE', employeePan, employeePan, 'string', employeePan ? 0.98 : 0.3, employeePanSnippet);

    // Period Fields
    addField('assessmentYear', 'Assessment Year', 'GENERAL', assessmentYear, assessmentYear, 'string', assessmentYear ? 0.95 : 0.5);
    addField('financialYear', 'Financial Year', 'GENERAL', financialYear, financialYear, 'string', financialYear ? 0.95 : 0.5);

    // Salary Fields
    addField('grossSalary', 'Gross Salary (Sec. 17)', 'SALARY', grossSalary?.toString() || null, grossSalary, 'number', grossSalary ? 0.95 : 0.3, grossSalarySnippet);
    if (exemptAllowances != null) addField('exemptAllowances', 'Exempt Allowances (Sec. 10)', 'SALARY', exemptAllowances.toString(), exemptAllowances, 'number', 0.9);
    addField('standardDeduction', 'Standard Deduction (Sec. 16(ia))', 'SALARY', standardDeduction?.toString() || null, standardDeduction, 'number', standardDeduction ? 0.95 : 0.4, standardDeductionSnippet);
    if (professionalTax != null) addField('professionalTax', 'Professional Tax (Sec. 16(iii))', 'SALARY', professionalTax.toString(), professionalTax, 'number', 0.9);
    addField('netTaxableSalary', 'Net Income from Salary', 'SALARY', netTaxableSalary?.toString() || null, netTaxableSalary, 'number', netTaxableSalary ? 0.95 : 0.4, netSalarySnippet);

    // Deductions Fields
    if (deductions80C != null) addField('deductions80C', 'Deductions u/s 80C', 'DEDUCTION', deductions80C.toString(), deductions80C, 'number', 0.95, deductions80CSnippet);
    if (deductions80CCD1B != null) addField('deductions80CCD1B', 'NPS Deduction u/s 80CCD(1B)', 'DEDUCTION', deductions80CCD1B.toString(), deductions80CCD1B, 'number', 0.9);
    if (deductions80CCD2 != null) addField('deductions80CCD2', 'Employer NPS u/s 80CCD(2)', 'DEDUCTION', deductions80CCD2.toString(), deductions80CCD2, 'number', 0.9);
    if (deductions80D != null) addField('deductions80D', 'Health Insurance u/s 80D', 'DEDUCTION', deductions80D.toString(), deductions80D, 'number', 0.9);
    if (totalDeductionsChapterVIA != null) addField('totalDeductionsChapterVIA', 'Total Chapter VI-A Deductions', 'DEDUCTION', totalDeductionsChapterVIA.toString(), totalDeductionsChapterVIA, 'number', 0.95);

    // Total Income & TDS Fields
    addField('totalTaxableIncome', 'Total Taxable Income', 'TAX', totalTaxableIncome?.toString() || null, totalTaxableIncome, 'number', totalTaxableIncome ? 0.95 : 0.4);
    addField('tdsDeducted', 'Total TDS Deducted', 'TAX', tdsDeducted?.toString() || null, tdsDeducted, 'number', tdsDeducted ? 0.95 : 0.3, tdsSnippet);
    addField('tdsDeposited', 'Total TDS Deposited', 'TAX', tdsDeposited?.toString() || null, tdsDeposited, 'number', tdsDeposited ? 0.95 : 0.3);

    // ── 6. SANITY AND VALIDATION CHECKS ──
    if (!employeePan) {
      warnings.push({
        code: 'MISSING_PAN',
        field: 'employeePan',
        message: 'Employee PAN was not detected on Form 16. Please enter manually.',
        severity: 'WARNING',
      });
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(employeePan)) {
      warnings.push({
        code: 'INVALID_PAN_FORMAT',
        field: 'employeePan',
        message: `Extracted PAN ${employeePan} does not match standard 10-character format.`,
        severity: 'ERROR',
      });
    }

    if (!employerTan) {
      warnings.push({
        code: 'MISSING_TAN',
        field: 'employerTan',
        message: 'Employer TAN was not found. Employer TAN is required for Form 16 TDS claim.',
        severity: 'WARNING',
      });
    }

    if (grossSalary == null) {
      warnings.push({
        code: 'MISSING_GROSS_SALARY',
        field: 'grossSalary',
        message: 'Gross Salary could not be located automatically. Please review.',
        severity: 'WARNING',
      });
    }

    const normalized: Form16NormalizedData = {
      employerName,
      employerTan,
      employerPan,
      employerAddress: null,
      employeeName,
      employeePan,
      financialYear,
      assessmentYear,
      grossSalary,
      exemptAllowances,
      standardDeduction,
      professionalTax,
      netTaxableSalary,
      deductions80C,
      deductions80CCD1B,
      deductions80CCD2,
      deductions80D,
      totalDeductionsChapterVIA,
      totalTaxableIncome,
      taxPayable: null,
      tdsDeducted,
      tdsDeposited,
    };

    return {
      fields,
      normalized,
      warnings,
    };
  }
}
