import { ExtractedFieldResult, ValidationWarning } from '../types';

export interface SalarySlipParseResult {
  fields: ExtractedFieldResult[];
  normalized: Record<string, any>;
  warnings: ValidationWarning[];
}

export class SalarySlipExtractor {
  public static extract(text: string, pages: Array<{ pageNumber: number; text: string }>): SalarySlipParseResult {
    const fields: ExtractedFieldResult[] = [];
    const warnings: ValidationWarning[] = [];

    const parseCurrency = (str?: string | null): number | null => {
      if (!str) return null;
      const cleaned = str.replace(/[₹Rs\.,\s/-]/g, (match, offset, full) => {
        if (match === '.' && offset === full.lastIndexOf('.')) return '.';
        return '';
      }).trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : Math.round(num * 100) / 100;
    };

    // Employee & Employer
    let employeeName: string | null = null;
    const empMatch = text.match(/(?:Employee\s+Name|Name\s+of\s+Employee|Name)[\s:.-]+([^\n\r,]{3,40})/i);
    if (empMatch) employeeName = empMatch[1].trim();

    let employerName: string | null = null;
    const empOrgMatch = text.match(/(?:Company|Employer|Organization)[\s:.-]+([^\n\r,]{3,50})/i);
    if (empOrgMatch) employerName = empOrgMatch[1].trim();

    // Pay Period
    let payPeriod: string | null = null;
    const periodMatch = text.match(/(?:Pay\s+Period|Payslip\s+for\s+the\s+month\s+of|Month)[\s:.-]+([^\n\r,]{3,30})/i);
    if (periodMatch) payPeriod = periodMatch[1].trim();

    // Earnings
    let basicSalary: number | null = null;
    const basicMatch = text.match(/(?:Basic\s+Salary|Basic\s+Pay|Basic)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (basicMatch) basicSalary = parseCurrency(basicMatch[1]);

    let hra: number | null = null;
    const hraMatch = text.match(/(?:HRA|House\s+Rent\s+Allowance)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (hraMatch) hra = parseCurrency(hraMatch[1]);

    let grossEarnings: number | null = null;
    const grossMatch = text.match(/(?:Total\s+Earnings|Gross\s+Salary|Gross\s+Earnings|Gross\s+Pay)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (grossMatch) grossEarnings = parseCurrency(grossMatch[1]);

    // Deductions
    let providentFund: number | null = null;
    const pfMatch = text.match(/(?:Provident\s+Fund|EPF|PF)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (pfMatch) providentFund = parseCurrency(pfMatch[1]);

    let professionalTax: number | null = null;
    const ptMatch = text.match(/(?:Professional\s+Tax|PT)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (ptMatch) professionalTax = parseCurrency(ptMatch[1]);

    let netSalary: number | null = null;
    const netMatch = text.match(/(?:Net\s+Pay|Net\s+Salary|Take\s+Home\s+Pay)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (netMatch) netSalary = parseCurrency(netMatch[1]);

    const addField = (name: string, label: string, category: 'EMPLOYER' | 'EMPLOYEE' | 'SALARY' | 'DEDUCTION' | 'GENERAL', raw: string | null, norm: any, type: any, conf: number) => {
      fields.push({
        fieldName: name,
        fieldLabel: label,
        category,
        rawValue: raw,
        normalizedValue: norm,
        dataType: type,
        confidence: conf,
        pageNumber: 1,
        isVerified: false,
      });
    };

    addField('employeeName', 'Employee Name', 'EMPLOYEE', employeeName, employeeName, 'string', employeeName ? 0.9 : 0.3);
    addField('employerName', 'Employer Name', 'EMPLOYER', employerName, employerName, 'string', employerName ? 0.9 : 0.3);
    addField('payPeriod', 'Pay Period', 'GENERAL', payPeriod, payPeriod, 'string', payPeriod ? 0.9 : 0.4);
    addField('basicSalary', 'Basic Salary', 'SALARY', basicSalary?.toString() || null, basicSalary, 'number', basicSalary ? 0.95 : 0.3);
    if (hra != null) addField('hra', 'House Rent Allowance (HRA)', 'SALARY', hra.toString(), hra, 'number', 0.95);
    addField('grossEarnings', 'Gross Earnings', 'SALARY', grossEarnings?.toString() || null, grossEarnings, 'number', grossEarnings ? 0.95 : 0.3);
    if (providentFund != null) addField('providentFund', 'Provident Fund (EPF)', 'DEDUCTION', providentFund.toString(), providentFund, 'number', 0.95);
    if (professionalTax != null) addField('professionalTax', 'Professional Tax (PT)', 'DEDUCTION', professionalTax.toString(), professionalTax, 'number', 0.95);
    addField('netSalary', 'Net Take-Home Salary', 'SALARY', netSalary?.toString() || null, netSalary, 'number', netSalary ? 0.95 : 0.3);

    return {
      fields,
      normalized: { employeeName, employerName, payPeriod, basicSalary, hra, grossEarnings, providentFund, professionalTax, netSalary },
      warnings,
    };
  }
}

