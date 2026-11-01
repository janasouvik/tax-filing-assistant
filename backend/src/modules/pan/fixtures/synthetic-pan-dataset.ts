/**
 * TaxPilot Synthetic PAN Verification Dataset (25 Records)
 *
 * All identities, names, dates of birth, and PAN-like values in this file are
 * strictly synthetic test fixtures for development, testing, and evaluation.
 *
 * HARD SECURITY BOUNDARY:
 * These identifiers must NEVER be transmitted to Setu or any real government /
 * external verification gateway. They are exclusively for Mock Provider mode.
 */

export interface SyntheticPanRecord {
  id: string; // V01-V10, I01-I05, N01-N05, D01-D05
  group: 'VERIFIED' | 'INVALID_PAN' | 'NAME_MISMATCH' | 'DOB_MISMATCH';
  pan: string;
  submittedName: string;
  registeredName: string | null;
  submittedDob: string; // Canonical format YYYY-MM-DD
  registeredDob: string | null; // Canonical format YYYY-MM-DD
  submittedDobDisplay: string; // DD/MM/YYYY
  registeredDobDisplay: string | null; // DD/MM/YYYY
  aadhaarStatus: 'LINKED' | 'NOT_LINKED' | 'UNKNOWN';
  expectedResult: 'PAN_VERIFIED' | 'INVALID_PAN' | 'INVALID_PAN_FORMAT' | 'NAME_MISMATCH' | 'DOB_MISMATCH';
  description: string;
  isSynthetic: true;
}

export const SYNTHETIC_PAN_DATASET: SyntheticPanRecord[] = [
  // =========================================================================
  // Group A — 10 properly verified PAN records (5 Linked, 5 Not Linked)
  // =========================================================================
  {
    id: 'V01',
    group: 'VERIFIED',
    pan: 'QWERT1234L',
    submittedName: 'Aarav Sharma',
    registeredName: 'Aarav Sharma',
    submittedDob: '1998-03-12',
    registeredDob: '1998-03-12',
    submittedDobDisplay: '12/03/1998',
    registeredDobDisplay: '12/03/1998',
    aadhaarStatus: 'LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Clean verified record with Aadhaar linked',
    isSynthetic: true,
  },
  {
    id: 'V02',
    group: 'VERIFIED',
    pan: 'ASDFG5678M',
    submittedName: 'Priya Verma',
    registeredName: 'Priya Verma',
    submittedDob: '1999-07-24',
    registeredDob: '1999-07-24',
    submittedDobDisplay: '24/07/1999',
    registeredDobDisplay: '24/07/1999',
    aadhaarStatus: 'LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Clean verified record with Aadhaar linked',
    isSynthetic: true,
  },
  {
    id: 'V03',
    group: 'VERIFIED',
    pan: 'ZXCVB2345N',
    submittedName: 'Rohan Das',
    registeredName: 'Rohan Das',
    submittedDob: '1997-11-18',
    registeredDob: '1997-11-18',
    submittedDobDisplay: '18/11/1997',
    registeredDobDisplay: '18/11/1997',
    aadhaarStatus: 'LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Clean verified record with Aadhaar linked',
    isSynthetic: true,
  },
  {
    id: 'V04',
    group: 'VERIFIED',
    pan: 'POIUY6789K',
    submittedName: 'Ananya Roy',
    registeredName: 'Ananya Roy',
    submittedDob: '2000-02-05',
    registeredDob: '2000-02-05',
    submittedDobDisplay: '05/02/2000',
    registeredDobDisplay: '05/02/2000',
    aadhaarStatus: 'LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Clean verified record with Aadhaar linked',
    isSynthetic: true,
  },
  {
    id: 'V05',
    group: 'VERIFIED',
    pan: 'MNBVC3456P',
    submittedName: 'Arjun Mehta',
    registeredName: 'Arjun Mehta',
    submittedDob: '1996-09-29',
    registeredDob: '1996-09-29',
    submittedDobDisplay: '29/09/1996',
    registeredDobDisplay: '29/09/1996',
    aadhaarStatus: 'LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Clean verified record with Aadhaar linked',
    isSynthetic: true,
  },
  {
    id: 'V06',
    group: 'VERIFIED',
    pan: 'LKJHG1234R',
    submittedName: 'Sneha Patel',
    registeredName: 'Sneha Patel',
    submittedDob: '1998-05-14',
    registeredDob: '1998-05-14',
    submittedDobDisplay: '14/05/1998',
    registeredDobDisplay: '14/05/1998',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Verified PAN record with Aadhaar not linked',
    isSynthetic: true,
  },
  {
    id: 'V07',
    group: 'VERIFIED',
    pan: 'TREWA5678S',
    submittedName: 'Karan Singh',
    registeredName: 'Karan Singh',
    submittedDob: '1997-08-21',
    registeredDob: '1997-08-21',
    submittedDobDisplay: '21/08/1997',
    registeredDobDisplay: '21/08/1997',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Verified PAN record with Aadhaar not linked',
    isSynthetic: true,
  },
  {
    id: 'V08',
    group: 'VERIFIED',
    pan: 'YUIOP2345T',
    submittedName: 'Ishita Gupta',
    registeredName: 'Ishita Gupta',
    submittedDob: '2001-12-09',
    registeredDob: '2001-12-09',
    submittedDobDisplay: '09/12/2001',
    registeredDobDisplay: '09/12/2001',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Verified PAN record with Aadhaar not linked',
    isSynthetic: true,
  },
  {
    id: 'V09',
    group: 'VERIFIED',
    pan: 'GHJKL6789U',
    submittedName: 'Aditya Nair',
    registeredName: 'Aditya Nair',
    submittedDob: '1999-04-16',
    registeredDob: '1999-04-16',
    submittedDobDisplay: '16/04/1999',
    registeredDobDisplay: '16/04/1999',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Verified PAN record with Aadhaar not linked',
    isSynthetic: true,
  },
  {
    id: 'V10',
    group: 'VERIFIED',
    pan: 'BNMQW3456V',
    submittedName: 'Meera Joshi',
    registeredName: 'Meera Joshi',
    submittedDob: '1998-01-30',
    registeredDob: '1998-01-30',
    submittedDobDisplay: '30/01/1998',
    registeredDobDisplay: '30/01/1998',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'PAN_VERIFIED',
    description: 'Verified PAN record with Aadhaar not linked',
    isSynthetic: true,
  },

  // =========================================================================
  // Group B — 5 invalid PAN records
  // =========================================================================
  {
    id: 'I01',
    group: 'INVALID_PAN',
    pan: 'ABC123',
    submittedName: 'Rahul Sharma',
    registeredName: null,
    submittedDob: '1992-05-14',
    registeredDob: null,
    submittedDobDisplay: '14/05/1992',
    registeredDobDisplay: null,
    aadhaarStatus: 'UNKNOWN',
    expectedResult: 'INVALID_PAN_FORMAT',
    description: 'Truncated PAN format ABC123 (6 characters instead of 10)',
    isSynthetic: true,
  },
  {
    id: 'I02',
    group: 'INVALID_PAN',
    pan: '12345ABCDE',
    submittedName: 'Neha Kapoor',
    registeredName: null,
    submittedDob: '1998-08-11',
    registeredDob: null,
    submittedDobDisplay: '11/08/1998',
    registeredDobDisplay: null,
    aadhaarStatus: 'UNKNOWN',
    expectedResult: 'INVALID_PAN_FORMAT',
    description: 'Inverted format: digits first then letters (12345ABCDE)',
    isSynthetic: true,
  },
  {
    id: 'I03',
    group: 'INVALID_PAN',
    pan: 'ABCDE123',
    submittedName: 'Vikram Das',
    registeredName: null,
    submittedDob: '1995-01-20',
    registeredDob: null,
    submittedDobDisplay: '20/01/1995',
    registeredDobDisplay: null,
    aadhaarStatus: 'UNKNOWN',
    expectedResult: 'INVALID_PAN_FORMAT',
    description: 'Missing trailing digits and checksum letter (ABCDE123)',
    isSynthetic: true,
  },
  {
    id: 'I04',
    group: 'INVALID_PAN',
    pan: 'ABCDE12XYZ',
    submittedName: 'Pooja Sen',
    registeredName: null,
    submittedDob: '2000-06-07',
    registeredDob: null,
    submittedDobDisplay: '07/06/2000',
    registeredDobDisplay: null,
    aadhaarStatus: 'UNKNOWN',
    expectedResult: 'INVALID_PAN_FORMAT',
    description: 'Invalid internal digit-letter structure (ABCDE12XYZ)',
    isSynthetic: true,
  },
  {
    id: 'I05',
    group: 'INVALID_PAN',
    pan: '1234567890',
    submittedName: 'Amit Roy',
    registeredName: null,
    submittedDob: '1996-10-19',
    registeredDob: null,
    submittedDobDisplay: '19/10/1996',
    registeredDobDisplay: null,
    aadhaarStatus: 'UNKNOWN',
    expectedResult: 'INVALID_PAN_FORMAT',
    description: 'All-digit string with no alphabetical prefix (1234567890)',
    isSynthetic: true,
  },

  // =========================================================================
  // Group C — 5 name mismatch records (PAN exists, DOB matches, Name differs)
  // =========================================================================
  {
    id: 'N01',
    group: 'NAME_MISMATCH',
    pan: 'PLMKO3456D',
    submittedName: 'Rahul Sharma',
    registeredName: 'Rahul Kumar Sharma',
    submittedDob: '1992-05-14',
    registeredDob: '1992-05-14',
    submittedDobDisplay: '14/05/1992',
    registeredDobDisplay: '14/05/1992',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'NAME_MISMATCH',
    description: 'Middle name omitted in submission (Rahul Sharma vs Rahul Kumar Sharma)',
    isSynthetic: true,
  },
  {
    id: 'N02',
    group: 'NAME_MISMATCH',
    pan: 'WERTO7890E',
    submittedName: 'Neha Singh',
    registeredName: 'Neha Kapoor',
    submittedDob: '1998-08-11',
    registeredDob: '1998-08-11',
    submittedDobDisplay: '11/08/1998',
    registeredDobDisplay: '11/08/1998',
    aadhaarStatus: 'LINKED',
    expectedResult: 'NAME_MISMATCH',
    description: 'Surname mismatch (Neha Singh vs Neha Kapoor)',
    isSynthetic: true,
  },
  {
    id: 'N03',
    group: 'NAME_MISMATCH',
    pan: 'FGHJK5678H',
    submittedName: 'Vikram Roy',
    registeredName: 'Vikram Das',
    submittedDob: '1995-01-20',
    registeredDob: '1995-01-20',
    submittedDobDisplay: '20/01/1995',
    registeredDobDisplay: '20/01/1995',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'NAME_MISMATCH',
    description: 'Surname mismatch (Vikram Roy vs Vikram Das)',
    isSynthetic: true,
  },
  {
    id: 'N04',
    group: 'NAME_MISMATCH',
    pan: 'QAZWS2468J',
    submittedName: 'Pooja Gupta',
    registeredName: 'Pooja Sen',
    submittedDob: '2000-06-07',
    registeredDob: '2000-06-07',
    submittedDobDisplay: '07/06/2000',
    registeredDobDisplay: '07/06/2000',
    aadhaarStatus: 'LINKED',
    expectedResult: 'NAME_MISMATCH',
    description: 'Surname mismatch (Pooja Gupta vs Pooja Sen)',
    isSynthetic: true,
  },
  {
    id: 'N05',
    group: 'NAME_MISMATCH',
    pan: 'EDRCF1357K',
    submittedName: 'Amit Kumar',
    registeredName: 'Amit Roy',
    submittedDob: '1996-10-19',
    registeredDob: '1996-10-19',
    submittedDobDisplay: '19/10/1996',
    registeredDobDisplay: '19/10/1996',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'NAME_MISMATCH',
    description: 'Surname mismatch (Amit Kumar vs Amit Roy)',
    isSynthetic: true,
  },

  // =========================================================================
  // Group D — 5 DOB mismatch records (PAN exists, Name matches, DOB differs)
  // =========================================================================
  {
    id: 'D01',
    group: 'DOB_MISMATCH',
    pan: 'UIOPA1234B',
    submittedName: 'Rahul Sharma',
    registeredName: 'Rahul Sharma',
    submittedDob: '1992-05-15',
    registeredDob: '1992-05-14',
    submittedDobDisplay: '15/05/1992',
    registeredDobDisplay: '14/05/1992',
    aadhaarStatus: 'LINKED',
    expectedResult: 'DOB_MISMATCH',
    description: 'Date off by one day: 15/05/1992 vs registered 14/05/1992',
    isSynthetic: true,
  },
  {
    id: 'D02',
    group: 'DOB_MISMATCH',
    pan: 'VBNMQ5678C',
    submittedName: 'Neha Kapoor',
    registeredName: 'Neha Kapoor',
    submittedDob: '1998-08-12',
    registeredDob: '1998-08-11',
    submittedDobDisplay: '12/08/1998',
    registeredDobDisplay: '11/08/1998',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'DOB_MISMATCH',
    description: 'Date off by one day: 12/08/1998 vs registered 11/08/1998',
    isSynthetic: true,
  },
  {
    id: 'D03',
    group: 'DOB_MISMATCH',
    pan: 'ASDFH9012D',
    submittedName: 'Vikram Das',
    registeredName: 'Vikram Das',
    submittedDob: '1995-01-21',
    registeredDob: '1995-01-20',
    submittedDobDisplay: '21/01/1995',
    registeredDobDisplay: '20/01/1995',
    aadhaarStatus: 'LINKED',
    expectedResult: 'DOB_MISMATCH',
    description: 'Date off by one day: 21/01/1995 vs registered 20/01/1995',
    isSynthetic: true,
  },
  {
    id: 'D04',
    group: 'DOB_MISMATCH',
    pan: 'ZXCVG3456E',
    submittedName: 'Pooja Sen',
    registeredName: 'Pooja Sen',
    submittedDob: '2000-06-08',
    registeredDob: '2000-06-07',
    submittedDobDisplay: '08/06/2000',
    registeredDobDisplay: '07/06/2000',
    aadhaarStatus: 'NOT_LINKED',
    expectedResult: 'DOB_MISMATCH',
    description: 'Date off by one day: 08/06/2000 vs registered 07/06/2000',
    isSynthetic: true,
  },
  {
    id: 'D05',
    group: 'DOB_MISMATCH',
    pan: 'POIUK7890F',
    submittedName: 'Amit Roy',
    registeredName: 'Amit Roy',
    submittedDob: '1996-10-20',
    registeredDob: '1996-10-19',
    submittedDobDisplay: '20/10/1996',
    registeredDobDisplay: '19/10/1996',
    aadhaarStatus: 'LINKED',
    expectedResult: 'DOB_MISMATCH',
    description: 'Date off by one day: 20/10/1996 vs registered 19/10/1996',
    isSynthetic: true,
  },
];

// Set of all synthetic PANs to enforce the hard boundary
export const SYNTHETIC_MOCK_PANS = new Set<string>([
  ...SYNTHETIC_PAN_DATASET.map(r => r.pan.toUpperCase().trim()),
  'ABCDE1234A', // Historical sandbox valid
  'ABCDE1234B', // Historical sandbox invalid
]);

/**
 * Hard Mock-Only Boundary Check
 * Returns true if the PAN belongs to the synthetic test fixtures.
 */
export function isSyntheticMockPan(pan: string): boolean {
  if (!pan || typeof pan !== 'string') return false;
  return SYNTHETIC_MOCK_PANS.has(pan.toUpperCase().trim());
}

/**
 * Retrieves a synthetic record by PAN.
 */
export function findSyntheticRecordByPan(pan: string): SyntheticPanRecord | undefined {
  const norm = pan.toUpperCase().trim();
  return SYNTHETIC_PAN_DATASET.find(r => r.pan.toUpperCase().trim() === norm);
}

/**
 * Retrieves a synthetic record by ID (e.g. 'V01', 'N01').
 */
export function findSyntheticRecordById(id: string): SyntheticPanRecord | undefined {
  const norm = id.toUpperCase().trim();
  return SYNTHETIC_PAN_DATASET.find(r => r.id.toUpperCase().trim() === norm);
}

