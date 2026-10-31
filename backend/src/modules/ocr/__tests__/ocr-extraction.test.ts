import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DocumentClassifier } from '../classifiers/document-classifier';
import { Form16Extractor } from '../extractors/form16.extractor';
import { SalarySlipExtractor } from '../extractors/salary-slip.extractor';
import { BankStatementExtractor } from '../extractors/bank-statement.extractor';
import { InvestmentProofExtractor } from '../extractors/investment.extractor';
import { ExtractionValidator } from '../validators/extraction-validator';
import { LocalStorageService } from '../storage/local-storage.service';
import os from 'os';
import path from 'path';
import fs from 'fs';

describe('OCR & Fiscal Document Intelligence Suite', () => {
  describe('DocumentClassifier', () => {
    it('classifies Form 16 correctly from statutory header cues', () => {
      const sampleForm16Text = `
        FORM NO. 16
        [See rule 31(1)(a)]
        PART A
        Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary
        Name and address of the Employer: ACME TECHNOLOGIES PVT LTD
        Name and address of the Employee: Rajesh Kumar
        PAN of Deductor: AABCA1234F
        TAN of Deductor: BLRA12345C
        PAN of Employee: ABCDE1234F
        Assessment Year: 2026-27
        Period with the Employer: From 01-Apr-2025 To 31-Mar-2026
        Quarterly statements of TDS: Q1, Q2, Q3, Q4
      `;
      const res = DocumentClassifier.classify(sampleForm16Text);
      expect(res.category).toBe('FORM_16');
      expect(res.confidence).toBeGreaterThan(0.7);
      expect(res.clues.length).toBeGreaterThan(0);
    });

    it('classifies Salary Slip correctly', () => {
      const samplePayslip = `
        ACME CORP - PAYSLIP FOR THE MONTH OF OCTOBER 2025
        Employee Name: Sneha Sharma
        Earnings:
        Basic Pay: 65,000.00
        House Rent Allowance: 25,000.00
        Special Allowance: 15,000.00
        Gross Salary: 1,05,000.00
        Deductions:
        Provident Fund: 7,800.00
        Professional Tax: 200.00
        Net Pay: 97,000.00
      `;
      const res = DocumentClassifier.classify(samplePayslip);
      expect(res.category).toBe('SALARY_SLIP');
      expect(res.confidence).toBeGreaterThan(0.7);
    });

    it('classifies Bank Statement correctly', () => {
      const sampleBank = `
        HDFC BANK - STATEMENT OF ACCOUNT
        Account Number: 50100234567890
        Customer Name: Sneha Sharma
        IFSC: HDFC0001234
        Opening Balance: 45,200.00
        Closing Balance: 1,12,400.00
        Date | Narration | Withdrawal | Deposit | Balance
        01/10/2025 | SALARY CREDIT | - | 97,000.00 | 1,42,200.00
      `;
      const res = DocumentClassifier.classify(sampleBank);
      expect(res.category).toBe('BANK_STATEMENT');
      expect(res.confidence).toBeGreaterThan(0.7);
    });

    it('classifies Investment Proof (Section 80C/80D) correctly', () => {
      const sampleInvest = `
        LIFE INSURANCE CORPORATION OF INDIA
        PREMIUM RECEIPT (VALID FOR SECTION 80C TAX DEDUCTION)
        Policy No: 123456789
        Insured Name: Rajesh Kumar
        Premium Amount: ₹ 45,000.00
        Financial Year: 2025-26
        Mode: Annual
      `;
      const res = DocumentClassifier.classify(sampleInvest);
      expect(res.category).toBe('INVESTMENT_PROOF');
      expect(res.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Form16Extractor', () => {
    it('extracts Part A & Part B values accurately', () => {
      const form16Text = `
        FORM NO. 16
        PART A
        Certificate under section 203
        Name of Employer: INFOSYS LIMITED
        PAN of the Deductor: AABCI1234K
        TAN of the Deductor: BLRI00123D
        PAN of the Employee: ABCDE1234F
        Name of Employee: VIKRAMADITYA SEN
        Assessment Year: 2026-27
        Financial Year: 2025-26

        PART B (Annexure)
        1. Gross Salary:
        (a) Salary as per provisions contained in sec 17(1): 18,50,000.00
        (b) Value of perquisites under section 17(2): 0.00
        Total Gross Salary: 18,50,000.00
        2. Less: Allowances exempt under section 10: 1,20,000.00
        3. Balance (1 - 2): 17,30,000.00
        4. Deductions under section 16:
        (a) Standard deduction under section 16(ia): 75,000.00
        (b) Tax on employment under section 16(iii): 2,400.00
        5. Income chargeable under the head 'Salaries' (3 - 4): 16,52,600.00
        6. Deductions under Chapter VI-A:
        (a) Section 80C: 1,50,000.00
        (b) Section 80CCD(1B): 50,000.00
        (c) Section 80D: 25,000.00
        Aggregate of deductible amount under Chapter VI-A: 2,25,000.00
        7. Total taxable income: 14,27,600.00
        8. Total Tax Deducted: 1,85,400.00
        9. Total tax deposited: 1,85,400.00
      `;

      const result = Form16Extractor.extract(form16Text, [{ pageNumber: 1, text: form16Text }]);

      expect(result.normalized.employerName).toBe('INFOSYS LIMITED');
      expect(result.normalized.employerTan).toBe('BLRI00123D');
      expect(result.normalized.employeePan).toBe('ABCDE1234F');
      expect(result.normalized.employeeName).toBe('VIKRAMADITYA SEN');
      expect(result.normalized.assessmentYear).toBe('2026-27');
      expect(result.normalized.financialYear).toBe('2025-26');
      expect(result.normalized.grossSalary).toBe(1850000);
      expect(result.normalized.standardDeduction).toBe(75000);
      expect(result.normalized.professionalTax).toBe(2400);
      expect(result.normalized.netTaxableSalary).toBe(1652600);
      expect(result.normalized.deductions80C).toBe(150000);
      expect(result.normalized.deductions80CCD1B).toBe(50000);
      expect(result.normalized.deductions80D).toBe(25000);
      expect(result.normalized.totalTaxableIncome).toBe(1427600);
      expect(result.normalized.tdsDeducted).toBe(185400);
      expect(result.normalized.tdsDeposited).toBe(185400);

      expect(result.warnings.length).toBe(0);
    });

    it('generates warnings when PAN or TAN is missing', () => {
      const incompleteText = `
        FORM NO. 16
        PART A
        Assessment Year: 2026-27
        Gross Salary: 12,00,000.00
      `;
      const result = Form16Extractor.extract(incompleteText, [{ pageNumber: 1, text: incompleteText }]);
      expect(result.warnings.some(w => w.code === 'MISSING_PAN')).toBe(true);
      expect(result.warnings.some(w => w.code === 'MISSING_TAN')).toBe(true);
    });
  });

  describe('ExtractionValidator', () => {
    it('detects malformed PAN correctly', () => {
      const warnings = ExtractionValidator.validate([
        {
          fieldName: 'employeePan',
          fieldLabel: 'PAN',
          category: 'EMPLOYEE',
          rawValue: 'ABCDE12345', // 5 digits instead of 4
          normalizedValue: 'ABCDE12345',
          dataType: 'string',
          confidence: 0.9,
          pageNumber: 1,
          isVerified: false,
        },
      ]);
      expect(warnings.some(w => w.code === 'INVALID_PAN_FORMAT')).toBe(true);
    });

    it('detects FY and AY misalignment', () => {
      const warnings = ExtractionValidator.validate([
        {
          fieldName: 'financialYear',
          fieldLabel: 'FY',
          category: 'GENERAL',
          rawValue: '2024-25',
          normalizedValue: '2024-25',
          dataType: 'string',
          confidence: 0.9,
          pageNumber: 1,
          isVerified: false,
        },
        {
          fieldName: 'assessmentYear',
          fieldLabel: 'AY',
          category: 'GENERAL',
          rawValue: '2026-27', // Should be 2025-26
          normalizedValue: '2026-27',
          dataType: 'string',
          confidence: 0.9,
          pageNumber: 1,
          isVerified: false,
        },
      ]);
      expect(warnings.some(w => w.code === 'FY_AY_MISALIGNMENT')).toBe(true);
    });

    it('detects TDS deficit when deposited is less than deducted', () => {
      const warnings = ExtractionValidator.validate([
        {
          fieldName: 'tdsDeducted',
          fieldLabel: 'TDS Deducted',
          category: 'TAX',
          rawValue: '100000',
          normalizedValue: 100000,
          dataType: 'number',
          confidence: 0.9,
          pageNumber: 1,
          isVerified: false,
        },
        {
          fieldName: 'tdsDeposited',
          fieldLabel: 'TDS Deposited',
          category: 'TAX',
          rawValue: '80000',
          normalizedValue: 80000,
          dataType: 'number',
          confidence: 0.9,
          pageNumber: 1,
          isVerified: false,
        },
      ]);
      expect(warnings.some(w => w.code === 'TDS_DEPOSIT_DEFICIT')).toBe(true);
    });
  });

  describe('LocalStorageService (Private Storage & Anti-Path-Traversal)', () => {
    let testStorageDir: string;
    let storage: LocalStorageService;

    beforeEach(() => {
      testStorageDir = path.join(os.tmpdir(), `taxpilot_test_storage_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      storage = new LocalStorageService(testStorageDir);
    });

    afterEach(async () => {
      if (fs.existsSync(testStorageDir)) {
        await fs.promises.rm(testStorageDir, { recursive: true, force: true });
      }
    });

    it('generates safe unique storage keys', () => {
      const { storageKey, absolutePath } = storage.generateStorageKey('ws-123', 'My Form 16.pdf');
      expect(storageKey).toContain('ws-123');
      expect(storageKey.endsWith('.pdf')).toBe(true);
      expect(absolutePath.startsWith(testStorageDir)).toBe(true);
    });

    it('prevents directory traversal attempts', () => {
      expect(() => {
        storage.resolveSafePath('../../etc/passwd');
      }).toThrow();

      expect(() => {
        storage.resolveSafePath('../outside.txt');
      }).toThrow();
    });

    it('saves and reads file buffers cleanly', async () => {
      const { storageKey } = storage.generateStorageKey('ws-test', 'receipt.png');
      const testBuffer = Buffer.from('TEST_BINARY_DATA');

      await storage.saveFile(storageKey, testBuffer);
      expect(storage.fileExists(storageKey)).toBe(true);

      const readBack = await storage.readFile(storageKey);
      expect(readBack.equals(testBuffer)).toBe(true);

      await storage.deleteFile(storageKey);
      expect(storage.fileExists(storageKey)).toBe(false);
    });
  });

  describe('SalarySlipExtractor', () => {
    it('extracts employee earnings and deductions from payslip', () => {
      const slipText = `
        PAYSLIP FOR THE MONTH OF NOVEMBER 2025
        Employee Name: Sneha Sharma
        Basic Salary: 75,000.00
        House Rent Allowance: 30,000.00
        Gross Earnings: 1,05,000.00
        Provident Fund: 9,000.00
        Professional Tax: 200.00
        Net Salary: 95,800.00
      `;
      const res = SalarySlipExtractor.extract(slipText, [{ pageNumber: 1, text: slipText }]);
      expect(res.normalized.employeeName).toBe('Sneha Sharma');
      expect(res.normalized.basicSalary).toBe(75000);
      expect(res.normalized.hra).toBe(30000);
      expect(res.normalized.grossEarnings).toBe(105000);
      expect(res.normalized.providentFund).toBe(9000);
      expect(res.normalized.professionalTax).toBe(200);
      expect(res.normalized.netSalary).toBe(95800);
    });
  });

  describe('BankStatementExtractor', () => {
    it('extracts bank accounts, balances and transactions', () => {
      const bankText = `
        STATE BANK OF INDIA
        STATEMENT OF ACCOUNT
        Account Number: 30123456789
        Customer Name: Rajesh Kumar
        IFSC Code: SBIN0001234
        Opening Balance: 25,000.00
        Closing Balance: 75,000.00
        15/10/2025 SALARY FROM EMPLOYER 50,000.00
      `;
      const res = BankStatementExtractor.extract(bankText, [{ pageNumber: 1, text: bankText }]);
      expect(res.normalized.bankName).toBe('State Bank of India');
      expect(res.normalized.accountHolder).toBe('Rajesh Kumar');
      expect(res.normalized.ifscCode).toBe('SBIN0001234');
      expect(res.normalized.openingBalance).toBe(25000);
      expect(res.normalized.closingBalance).toBe(75000);
      expect(res.transactions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('InvestmentProofExtractor', () => {
    it('extracts Section 80C premium certificate', () => {
      const licText = `
        HDFC LIFE INSURANCE COMPANY
        PREMIUM PAID CERTIFICATE
        Policy Number: 98765432
        Total Amount: ₹ 50,000.00
        Eligible for Deduction under Section 80C of the Income Tax Act
        Financial Year: 2025-26
      `;
      const res = InvestmentProofExtractor.extract(licText, [{ pageNumber: 1, text: licText }]);
      expect(res.normalized.institutionName).toBe('HDFC Life');
      expect(res.normalized.section).toBe('SEC_80C');
      expect(res.normalized.amount).toBe(50000);
      expect(res.normalized.policyNumber).toBe('98765432');
      expect(res.normalized.financialYear).toBe('2025-26');
    });
  });
});

