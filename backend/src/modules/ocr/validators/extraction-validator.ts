import { ExtractedFieldResult, ValidationWarning } from '../types';

export class ExtractionValidator {
  /**
   * Performs deep sanity and regulatory consistency checks across extracted fields.
   */
  public static validate(fields: ExtractedFieldResult[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const getField = (name: string) => fields.find(f => f.fieldName === name);

    // 1. PAN Format Check
    const panField = getField('employeePan');
    if (panField && panField.normalizedValue) {
      const panStr = String(panField.normalizedValue).toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panStr)) {
        warnings.push({
          code: 'INVALID_PAN_FORMAT',
          field: 'employeePan',
          message: `PAN "${panStr}" is not a valid 10-character Indian Permanent Account Number.`,
          severity: 'ERROR',
        });
      }
    }

    // 2. TAN Format Check
    const tanField = getField('employerTan');
    if (tanField && tanField.normalizedValue) {
      const tanStr = String(tanField.normalizedValue).toUpperCase();
      if (!/^[A-Z]{4}[0-9]{5}[A-Z]$/.test(tanStr)) {
        warnings.push({
          code: 'INVALID_TAN_FORMAT',
          field: 'employerTan',
          message: `Employer TAN "${tanStr}" is not a valid 10-character Tax Deduction Account Number.`,
          severity: 'WARNING',
        });
      }
    }

    // 3. Financial Year vs Assessment Year Alignment
    const ayField = getField('assessmentYear');
    const fyField = getField('financialYear');
    if (ayField?.normalizedValue && fyField?.normalizedValue) {
      const ayMatch = String(ayField.normalizedValue).match(/^20(\d{2})/);
      const fyMatch = String(fyField.normalizedValue).match(/^20(\d{2})/);
      if (ayMatch && fyMatch) {
        const ayStart = parseInt(ayMatch[1], 10);
        const fyStart = parseInt(fyMatch[1], 10);
        if (ayStart !== fyStart + 1) {
          warnings.push({
            code: 'FY_AY_MISALIGNMENT',
            field: 'assessmentYear',
            message: `Assessment Year (${ayField.normalizedValue}) and Financial Year (${fyField.normalizedValue}) do not align. For FY ${fyField.normalizedValue}, the corresponding AY is 20${fyStart + 1}-${fyStart + 2}.`,
            severity: 'WARNING',
          });
        }
      }
    }

    // 4. Mathematical Consistency: Gross Salary vs Net Salary
    const grossField = getField('grossSalary');
    const netField = getField('netTaxableSalary');
    const stdField = getField('standardDeduction');
    const ptField = getField('professionalTax');
    const exemptField = getField('exemptAllowances');

    if (grossField && typeof grossField.normalizedValue === 'number' && netField && typeof netField.normalizedValue === 'number') {
      const gross = grossField.normalizedValue;
      const net = netField.normalizedValue;
      const std = (typeof stdField?.normalizedValue === 'number' ? stdField.normalizedValue : 0);
      const pt = (typeof ptField?.normalizedValue === 'number' ? ptField.normalizedValue : 0);
      const exempt = (typeof exemptField?.normalizedValue === 'number' ? exemptField.normalizedValue : 0);

      const expectedNet = Math.max(0, gross - (std + pt + exempt));
      const difference = Math.abs(net - expectedNet);

      if (difference > 1000 && gross > 0) {
        warnings.push({
          code: 'SALARY_MATH_DISCREPANCY',
          field: 'netTaxableSalary',
          message: `Salary arithmetic discrepancy: Gross (₹${gross.toLocaleString('en-IN')}) minus deductions (₹${(std + pt + exempt).toLocaleString('en-IN')}) equals ₹${expectedNet.toLocaleString('en-IN')}, but reported net salary is ₹${net.toLocaleString('en-IN')}.`,
          severity: 'INFO',
        });
      }
    }

    // 5. TDS Deducted vs Deposited
    const tdsDeductedField = getField('tdsDeducted');
    const tdsDepositedField = getField('tdsDeposited');
    if (
      tdsDeductedField && typeof tdsDeductedField.normalizedValue === 'number' &&
      tdsDepositedField && typeof tdsDepositedField.normalizedValue === 'number'
    ) {
      if (tdsDepositedField.normalizedValue < tdsDeductedField.normalizedValue) {
        warnings.push({
          code: 'TDS_DEPOSIT_DEFICIT',
          field: 'tdsDeposited',
          message: `TDS deposited (₹${tdsDepositedField.normalizedValue.toLocaleString('en-IN')}) is less than TDS deducted (₹${tdsDeductedField.normalizedValue.toLocaleString('en-IN')}). Claiming un-deposited TDS may trigger ITD notice.`,
          severity: 'WARNING',
        });
      }
    }

    return warnings;
  }
}

