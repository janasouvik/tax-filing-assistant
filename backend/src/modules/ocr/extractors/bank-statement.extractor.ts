import { ExtractedFieldResult, BankTransactionItem, ValidationWarning } from '../types';

export interface BankStatementParseResult {
  fields: ExtractedFieldResult[];
  transactions: BankTransactionItem[];
  normalized: Record<string, any>;
  warnings: ValidationWarning[];
}

export class BankStatementExtractor {
  public static extract(text: string, _pages: Array<{ pageNumber: number; text: string }>): BankStatementParseResult {
    const fields: ExtractedFieldResult[] = [];
    const warnings: ValidationWarning[] = [];
    const transactions: BankTransactionItem[] = [];

    const parseCurrency = (str?: string | null): number | null => {
      if (!str) return null;
      const cleaned = str.replace(/[₹Rs\.,\s/-]/g, (match, offset, full) => {
        if (match === '.' && offset === full.lastIndexOf('.')) return '.';
        return '';
      }).trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : Math.round(num * 100) / 100;
    };

    // Bank Name
    let bankName: string | null = null;
    const knownBanks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda'];
    for (const b of knownBanks) {
      if (new RegExp(b, 'i').test(text)) {
        bankName = b;
        break;
      }
    }
    if (!bankName) {
      const bMatch = text.match(/(?:Bank\s+Name|Bank)[\s:.-]+([^\n\r,]{3,40})/i);
      if (bMatch) bankName = bMatch[1].trim();
    }

    // Account Holder
    let accountHolder: string | null = null;
    const holderMatch = text.match(/(?:Account\s+Holder\s+Name|Name|Customer\s+Name)[\s:.-]+([^\n\r,]{3,40})/i);
    if (holderMatch) accountHolder = holderMatch[1].trim();

    // Account Number
    let accountNumber: string | null = null;
    const accMatch = text.match(/(?:Account\s+(?:No|Number)|A\/C\s+No\.?)[\s:.-]*([0-9X*x]{8,18})/i);
    if (accMatch) {
      const raw = accMatch[1].trim();
      accountNumber = raw.length > 4 ? `XXXX-XXXX-${raw.slice(-4)}` : raw;
    }

    // IFSC Code
    let ifscCode: string | null = null;
    const ifscMatch = text.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/);
    if (ifscMatch) ifscCode = ifscMatch[1].toUpperCase();

    // Opening and Closing Balances
    let openingBalance: number | null = null;
    const openMatch = text.match(/(?:Opening\s+Balance|Start\s+Balance)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (openMatch) openingBalance = parseCurrency(openMatch[1]);

    let closingBalance: number | null = null;
    const closeMatch = text.match(/(?:Closing\s+Balance|Ending\s+Balance)[\s:.-]+(?:Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (closeMatch) closingBalance = parseCurrency(closeMatch[1]);

    // Parse transaction lines (Date, Narration, Debit, Credit, Balance)
    const lines = text.split('\n');
    const dateRegex = /\b(\d{2}[-/.]\d{2}[-/.]\d{2,4})\b/;

    for (const line of lines) {
      const dMatch = line.match(dateRegex);
      if (dMatch) {
        const amounts = Array.from(line.matchAll(/(?:Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2}))/g));
        if (amounts.length >= 1) {
          const dateStr = dMatch[1];
          const desc = line.replace(dateRegex, '').replace(/(?:Rs\.?|₹)?\s*([0-9,]+\.[0-9]{2})/g, '').trim().slice(0, 80);
          const isCredit = /cr|credit|deposit|salary|interest/i.test(line);
          const val = parseCurrency(amounts[0][1]) || 0;

          if (val > 0) {
            transactions.push({
              date: dateStr,
              description: desc || 'Bank Transaction',
              type: isCredit ? 'CREDIT' : 'DEBIT',
              amount: val,
              runningBalance: amounts.length > 1 ? parseCurrency(amounts[amounts.length - 1][1]) || undefined : undefined,
            });
          }
        }
      }
    }

    const addField = (name: string, label: string, category: 'BANK' | 'GENERAL', raw: string | null, norm: any, type: any, conf: number) => {
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

    addField('bankName', 'Bank Name', 'BANK', bankName, bankName, 'string', bankName ? 0.95 : 0.4);
    addField('accountHolder', 'Account Holder', 'BANK', accountHolder, accountHolder, 'string', accountHolder ? 0.9 : 0.3);
    addField('accountNumber', 'Account Number (Masked)', 'BANK', accountNumber, accountNumber, 'string', accountNumber ? 0.95 : 0.3);
    if (ifscCode) addField('ifscCode', 'IFSC Code', 'BANK', ifscCode, ifscCode, 'string', 0.98);
    if (openingBalance != null) addField('openingBalance', 'Opening Balance', 'BANK', openingBalance.toString(), openingBalance, 'number', 0.9);
    if (closingBalance != null) addField('closingBalance', 'Closing Balance', 'BANK', closingBalance.toString(), closingBalance, 'number', 0.9);

    return {
      fields,
      transactions,
      normalized: { bankName, accountHolder, accountNumber, ifscCode, openingBalance, closingBalance, transactionCount: transactions.length },
      warnings,
    };
  }
}

