import { ExtractedFieldResult, ValidationWarning } from '../types';

export interface InvestmentProofParseResult {
  fields: ExtractedFieldResult[];
  normalized: Record<string, any>;
  warnings: ValidationWarning[];
}

export class InvestmentProofExtractor {
  public static extract(text: string, _pages: Array<{ pageNumber: number; text: string }>): InvestmentProofParseResult {
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

    // Institution Name
    let institutionName: string | null = null;
    const knownInsts = [
      'Life Insurance Corporation of India',
      'LIC of India',
      'HDFC Life',
      'ICICI Prudential',
      'SBI Life',
      'Max Life',
      'National Pension System',
      'Star Health',
      'Care Health',
      'Niva Bupa',
    ];
    for (const inst of knownInsts) {
      if (new RegExp(inst, 'i').test(text)) {
        institutionName = inst;
        break;
      }
    }
    if (!institutionName) {
      const match = text.match(/(?:Company|Insurer|Institution|Bank)[\s:.-]+([^\n\r,]{3,50})/i);
      if (match) institutionName = match[1].trim();
    }

    // Deduction Section
    let section = 'SEC_80C';
    if (/80d\b|health\s+insurance|medical\s+insurance/i.test(text)) {
      section = 'SEC_80D';
    } else if (/80ccd\(1b\)|tier\s+i|pran\b|nps\b/i.test(text)) {
      section = 'SEC_80CCD1B';
    } else if (/80g\b|donation|trust/i.test(text)) {
      section = 'SEC_80G';
    }

    // Policy or Reference Number
    let policyNumber: string | null = null;
    const polMatch = text.match(/(?:Policy\s+(?:No|Number)|PRAN|Receipt\s+No)[\s:.-]*([A-Z0-9-]{6,25})/i);
    if (polMatch) policyNumber = polMatch[1].trim();

    // Contribution Amount
    let amount: number | null = null;
    const amtMatch = text.match(/(?:Premium\s+Amount|Amount\s+Paid|Total\s+Amount|Contribution|Sum\s+Assured)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (amtMatch) amount = parseCurrency(amtMatch[1]);

    // Financial Year
    let financialYear: string | null = null;
    const fyMatch = text.match(/(?:Financial\s+Year|F\.?Y\.?)[\s:.-]*([0-9]{4}\s*[-–/]\s*[0-9]{2,4})/i);
    if (fyMatch) financialYear = fyMatch[1].replace(/\s+/g, '');

    const addField = (name: string, label: string, category: 'DEDUCTION' | 'GENERAL', raw: string | null, norm: any, type: any, conf: number) => {
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

    addField('institutionName', 'Institution / Insurer', 'GENERAL', institutionName, institutionName, 'string', institutionName ? 0.95 : 0.3);
    addField('deductionSection', 'Eligible Tax Section', 'DEDUCTION', section, section, 'string', 0.95);
    addField('amount', 'Invested / Premium Amount', 'DEDUCTION', amount?.toString() || null, amount, 'number', amount ? 0.95 : 0.3);
    if (policyNumber) addField('policyNumber', 'Policy / Account Number', 'GENERAL', policyNumber, policyNumber, 'string', 0.9);
    if (financialYear) addField('financialYear', 'Financial Year', 'GENERAL', financialYear, financialYear, 'string', 0.9);

    return {
      fields,
      normalized: { institutionName, section, amount, policyNumber, financialYear },
      warnings,
    };
  }
}

