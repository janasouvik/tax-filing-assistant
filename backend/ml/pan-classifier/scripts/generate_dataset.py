#!/usr/bin/env python3
"""
TaxPilot PAN Identity Classification Pipeline — Stage 1
Synthetic Dataset Generator (Strict Domain Constraints & Robust Feature Covariance)

Generates a realistic, reproducible synthetic dataset for identity pattern classification:
  - VERIFIED_PATTERN
  - REJECTED_PATTERN
  - MANUAL_REVIEW

DOMAIN RULES & LOGICAL INVARIANTS:
1. pan_format_valid == 0 MUST NEVER be VERIFIED_PATTERN. (Always REJECTED_PATTERN)
2. pan_field_present == 0 MUST NEVER be VERIFIED_PATTERN. (Always REJECTED_PATTERN)
3. provider_response_status in ['FAILED', 'NOT_FOUND'] MUST NEVER be VERIFIED_PATTERN. (Always REJECTED_PATTERN)
4. duplicate_submission == 1 MUST NEVER be VERIFIED_PATTERN. (MANUAL_REVIEW or REJECTED_PATTERN)
5. VERIFIED_PATTERN requires:
   pan_format_valid=1, pan_field_present=1, dob_format_valid=1, dob_match=1,
   name_match>=0.82, provider_response_status='SUCCESS', duplicate_submission=0,
   identity_details_consistent=1, document_quality>=0.65, document_readability>=0.65.
6. Crucially: High name_completeness and high data_completeness appear in REJECTED and
   MANUAL_REVIEW cohorts to prevent shortcut learning.
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

RANDOM_SEED = 42
TOTAL_SAMPLES = 2500

def generate_synthetic_dataset(n_samples: int = TOTAL_SAMPLES, seed: int = RANDOM_SEED) -> pd.DataFrame:
    np.random.seed(seed)

    # Balanced, realistic distribution: 40% Verified, 35% Rejected, 25% Manual Review
    n_verified = int(n_samples * 0.40) # 1000
    n_rejected = int(n_samples * 0.35) # 875
    n_review = n_samples - n_verified - n_rejected # 625

    applicant_types = ['INDIVIDUAL', 'COMPANY', 'FIRM', 'HUF', 'AOP', 'TRUST']
    type_probs = [0.80, 0.09, 0.05, 0.03, 0.02, 0.01]

    records = []

    # =========================================================================
    # 1. VERIFIED_PATTERN Records (1,000 samples)
    # Complete, authentic, valid format, verified by provider
    # =========================================================================
    for _ in range(n_verified):
        rec = {
            'pan_format_valid': 1,
            'name_match': float(np.clip(np.random.beta(9.0, 1.2), 0.82, 1.0)),
            'dob_match': 1,
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.80, 1.0), 0.75, 1.0)),
            'dob_format_valid': 1,
            'pan_field_present': 1,
            'identity_details_consistent': 1,
            'document_quality': float(np.clip(np.random.uniform(0.70, 1.0), 0.65, 1.0)),
            'document_readability': float(np.clip(np.random.uniform(0.70, 1.0), 0.65, 1.0)),
            'duplicate_submission': 0,
            'provider_response_available': 1,
            'provider_response_status': 'SUCCESS',
            'previous_verification_attempts': int(np.random.choice([0, 1], p=[0.90, 0.10])),
            'data_completeness': float(np.clip(np.random.uniform(0.85, 1.0), 0.80, 1.0)),
            'verification_class': 'VERIFIED_PATTERN'
        }
        records.append(rec)

    # =========================================================================
    # 2. REJECTED_PATTERN Records (875 samples)
    # Distinct failure modes. MUST include samples with HIGH name/data completeness!
    # =========================================================================
    n_rej_bad_format = int(n_rejected * 0.30)       # 262: Invalid PAN format (even with full form completed)
    n_rej_provider_fail = int(n_rejected * 0.30)    # 262: Valid format, but provider FAILED or NOT_FOUND
    n_rej_severe_mismatch = int(n_rejected * 0.20)  # 175: Wrong person (low name match, dob mismatch)
    n_rej_unreadable_missing = int(n_rejected * 0.10) # 87: Corrupt scan, missing PAN field
    n_rej_fraud_duplicate = n_rejected - n_rej_bad_format - n_rej_provider_fail - n_rej_severe_mismatch - n_rej_unreadable_missing # 89: Abuse/duplicate spam

    # 2A. Invalid PAN Format (Applicant filled name and form, but entered invalid PAN syntax)
    for _ in range(n_rej_bad_format):
        rec = {
            'pan_format_valid': 0, # INVALID SYNTAX
            'name_match': float(np.clip(np.random.beta(5.0, 2.0), 0.40, 1.0)), # Can be high!
            'dob_match': int(np.random.choice([1, 0], p=[0.70, 0.30])),
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.70, 1.0), 0.60, 1.0)), # High completeness!
            'dob_format_valid': int(np.random.choice([1, 0], p=[0.90, 0.10])),
            'pan_field_present': 1,
            'identity_details_consistent': int(np.random.choice([1, 0], p=[0.60, 0.40])),
            'document_quality': float(np.clip(np.random.uniform(0.40, 0.90), 0.20, 1.0)),
            'document_readability': float(np.clip(np.random.uniform(0.40, 0.90), 0.20, 1.0)),
            'duplicate_submission': 0,
            'provider_response_available': 0, # Cannot query provider with invalid syntax
            'provider_response_status': 'FAILED',
            'previous_verification_attempts': int(np.random.choice([0, 1, 2], p=[0.70, 0.20, 0.10])),
            'data_completeness': float(np.clip(np.random.uniform(0.75, 1.0), 0.60, 1.0)), # High completeness!
            'verification_class': 'REJECTED_PATTERN'
        }
        records.append(rec)

    # 2B. Provider Rejection (Valid format, but not in ITD or marked inoperative/failed)
    for _ in range(n_rej_provider_fail):
        prov_stat = np.random.choice(['FAILED', 'NOT_FOUND'], p=[0.55, 0.45])
        rec = {
            'pan_format_valid': 1,
            'name_match': float(np.clip(np.random.beta(2.0, 4.0), 0.05, 0.50)),
            'dob_match': int(np.random.choice([0, 1], p=[0.85, 0.15])),
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.50, 0.95), 0.40, 1.0)),
            'dob_format_valid': 1,
            'pan_field_present': 1,
            'identity_details_consistent': int(np.random.choice([0, 1], p=[0.80, 0.20])),
            'document_quality': float(np.clip(np.random.uniform(0.30, 0.80), 0.20, 1.0)),
            'document_readability': float(np.clip(np.random.uniform(0.30, 0.80), 0.20, 1.0)),
            'duplicate_submission': 0,
            'provider_response_available': 1,
            'provider_response_status': prov_stat,
            'previous_verification_attempts': int(np.random.choice([1, 2, 3], p=[0.40, 0.40, 0.20])),
            'data_completeness': float(np.clip(np.random.uniform(0.60, 0.95), 0.50, 1.0)),
            'verification_class': 'REJECTED_PATTERN'
        }
        records.append(rec)

    # 2C. Severe Identity Mismatch (Complete mismatch against registered record)
    for _ in range(n_rej_severe_mismatch):
        rec = {
            'pan_format_valid': int(np.random.choice([1, 0], p=[0.85, 0.15])),
            'name_match': float(np.clip(np.random.beta(1.2, 5.0), 0.0, 0.35)), # Low match!
            'dob_match': 0, # DOB mismatch!
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.50, 0.90), 0.30, 1.0)),
            'dob_format_valid': int(np.random.choice([1, 0], p=[0.80, 0.20])),
            'pan_field_present': 1,
            'identity_details_consistent': 0,
            'document_quality': float(np.clip(np.random.uniform(0.25, 0.70), 0.10, 0.90)),
            'document_readability': float(np.clip(np.random.uniform(0.25, 0.70), 0.10, 0.90)),
            'duplicate_submission': int(np.random.choice([0, 1], p=[0.70, 0.30])),
            'provider_response_available': 1,
            'provider_response_status': 'FAILED',
            'previous_verification_attempts': int(np.random.choice([1, 2, 3, 4], p=[0.30, 0.40, 0.20, 0.10])),
            'data_completeness': float(np.clip(np.random.uniform(0.50, 0.85), 0.30, 1.0)),
            'verification_class': 'REJECTED_PATTERN'
        }
        records.append(rec)

    # 2D. Corrupt / Missing Document
    for _ in range(n_rej_unreadable_missing):
        rec = {
            'pan_format_valid': int(np.random.choice([1, 0], p=[0.60, 0.40])),
            'name_match': float(np.clip(np.random.beta(1.5, 4.0), 0.05, 0.45)),
            'dob_match': 0,
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.20, 0.60), 0.10, 0.80)),
            'dob_format_valid': int(np.random.choice([1, 0], p=[0.50, 0.50])),
            'pan_field_present': int(np.random.choice([0, 1], p=[0.60, 0.40])), # Often missing!
            'identity_details_consistent': 0,
            'document_quality': float(np.clip(np.random.uniform(0.05, 0.25), 0.0, 0.30)), # Corrupt
            'document_readability': float(np.clip(np.random.uniform(0.05, 0.25), 0.0, 0.30)), # Unreadable
            'duplicate_submission': 0,
            'provider_response_available': int(np.random.choice([0, 1], p=[0.70, 0.30])),
            'provider_response_status': 'FAILED',
            'previous_verification_attempts': int(np.random.choice([1, 2, 3], p=[0.50, 0.30, 0.20])),
            'data_completeness': float(np.clip(np.random.uniform(0.20, 0.55), 0.10, 0.70)),
            'verification_class': 'REJECTED_PATTERN'
        }
        records.append(rec)

    # 2E. Fraudulent / Repeated Retries
    for _ in range(n_rej_fraud_duplicate):
        rec = {
            'pan_format_valid': int(np.random.choice([1, 0], p=[0.70, 0.30])),
            'name_match': float(np.clip(np.random.beta(2.0, 3.5), 0.10, 0.60)),
            'dob_match': int(np.random.choice([0, 1], p=[0.75, 0.25])),
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.40, 0.85), 0.30, 0.95)),
            'dob_format_valid': int(np.random.choice([1, 0], p=[0.80, 0.20])),
            'pan_field_present': 1,
            'identity_details_consistent': 0,
            'document_quality': float(np.clip(np.random.uniform(0.30, 0.65), 0.15, 0.80)),
            'document_readability': float(np.clip(np.random.uniform(0.30, 0.65), 0.15, 0.80)),
            'duplicate_submission': 1, # Flagged duplicate!
            'provider_response_available': 1,
            'provider_response_status': np.random.choice(['FAILED', 'NOT_FOUND'], p=[0.60, 0.40]),
            'previous_verification_attempts': int(np.random.choice([4, 5, 6, 7], p=[0.40, 0.30, 0.20, 0.10])),
            'data_completeness': float(np.clip(np.random.uniform(0.50, 0.80), 0.30, 0.90)),
            'verification_class': 'REJECTED_PATTERN'
        }
        records.append(rec)

    # =========================================================================
    # 3. MANUAL_REVIEW Records (625 samples)
    # Ambiguous, minor discrepancies, gateway timeout, or moderate scan quality
    # MUST have pan_format_valid == 1 (if syntax is invalid, it is rejected, not review)
    # =========================================================================
    n_rev_name_typo = int(n_review * 0.35)       # 218: Minor spelling variance (0.50 <= name_match < 0.82)
    n_rev_timeout = int(n_review * 0.30)         # 187: Provider TIMEOUT or PENDING
    n_rev_doc_quality = int(n_review * 0.20)     # 125: Moderate scan blur (0.35 <= quality < 0.65)
    n_rev_duplicate = n_review - n_rev_name_typo - n_rev_timeout - n_rev_doc_quality # 95: Duplicate flag or retry

    # 3A. Minor Name Typo / Transliteration Variance
    for _ in range(n_rev_name_typo):
        rec = {
            'pan_format_valid': 1, # Valid format
            'name_match': float(np.clip(np.random.uniform(0.50, 0.81), 0.48, 0.81)), # Ambiguous match!
            'dob_match': 1,
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.65, 0.95), 0.50, 1.0)),
            'dob_format_valid': 1,
            'pan_field_present': 1,
            'identity_details_consistent': 1,
            'document_quality': float(np.clip(np.random.uniform(0.55, 0.85), 0.40, 0.95)),
            'document_readability': float(np.clip(np.random.uniform(0.55, 0.85), 0.40, 0.95)),
            'duplicate_submission': 0,
            'provider_response_available': 1,
            'provider_response_status': 'SUCCESS',
            'previous_verification_attempts': int(np.random.choice([0, 1, 2], p=[0.70, 0.20, 0.10])),
            'data_completeness': float(np.clip(np.random.uniform(0.75, 0.95), 0.65, 1.0)),
            'verification_class': 'MANUAL_REVIEW'
        }
        records.append(rec)

    # 3B. Provider Timeout / Pending
    for _ in range(n_rev_timeout):
        prov_stat = np.random.choice(['TIMEOUT', 'PENDING'], p=[0.70, 0.30])
        rec = {
            'pan_format_valid': 1,
            'name_match': float(np.clip(np.random.beta(6.0, 2.0), 0.65, 0.98)),
            'dob_match': int(np.random.choice([1, 0], p=[0.85, 0.15])),
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.70, 0.95), 0.55, 1.0)),
            'dob_format_valid': 1,
            'pan_field_present': 1,
            'identity_details_consistent': 1,
            'document_quality': float(np.clip(np.random.uniform(0.55, 0.85), 0.40, 0.95)),
            'document_readability': float(np.clip(np.random.uniform(0.55, 0.85), 0.40, 0.95)),
            'duplicate_submission': 0,
            'provider_response_available': int(prov_stat == 'PENDING'),
            'provider_response_status': prov_stat,
            'previous_verification_attempts': int(np.random.choice([1, 2], p=[0.70, 0.30])),
            'data_completeness': float(np.clip(np.random.uniform(0.70, 0.95), 0.60, 1.0)),
            'verification_class': 'MANUAL_REVIEW'
        }
        records.append(rec)

    # 3C. Moderate Document Degradation (Borderline quality)
    for _ in range(n_rev_doc_quality):
        rec = {
            'pan_format_valid': 1,
            'name_match': float(np.clip(np.random.uniform(0.70, 0.92), 0.60, 0.98)),
            'dob_match': 1,
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.65, 0.90), 0.50, 1.0)),
            'dob_format_valid': 1,
            'pan_field_present': 1,
            'identity_details_consistent': 1,
            'document_quality': float(np.clip(np.random.uniform(0.35, 0.62), 0.30, 0.65)), # Degraded
            'document_readability': float(np.clip(np.random.uniform(0.35, 0.62), 0.30, 0.65)), # Degraded
            'duplicate_submission': 0,
            'provider_response_available': 1,
            'provider_response_status': 'SUCCESS',
            'previous_verification_attempts': int(np.random.choice([0, 1, 2], p=[0.60, 0.30, 0.10])),
            'data_completeness': float(np.clip(np.random.uniform(0.70, 0.90), 0.55, 0.95)),
            'verification_class': 'MANUAL_REVIEW'
        }
        records.append(rec)

    # 3D. Duplicate Submission Flag
    for _ in range(n_rev_duplicate):
        rec = {
            'pan_format_valid': 1,
            'name_match': float(np.clip(np.random.uniform(0.75, 0.95), 0.65, 0.98)),
            'dob_match': 1,
            'applicant_type': np.random.choice(applicant_types, p=type_probs),
            'name_completeness': float(np.clip(np.random.uniform(0.70, 0.95), 0.60, 1.0)),
            'dob_format_valid': 1,
            'pan_field_present': 1,
            'identity_details_consistent': int(np.random.choice([1, 0], p=[0.70, 0.30])),
            'document_quality': float(np.clip(np.random.uniform(0.60, 0.85), 0.45, 0.95)),
            'document_readability': float(np.clip(np.random.uniform(0.60, 0.85), 0.45, 0.95)),
            'duplicate_submission': 1, # Flagged duplicate!
            'provider_response_available': 1,
            'provider_response_status': 'SUCCESS',
            'previous_verification_attempts': int(np.random.choice([2, 3], p=[0.60, 0.40])),
            'data_completeness': float(np.clip(np.random.uniform(0.75, 0.95), 0.65, 1.0)),
            'verification_class': 'MANUAL_REVIEW'
        }
        records.append(rec)

    # Shuffle dataset
    df = pd.DataFrame(records).sample(frac=1.0, random_state=seed).reset_index(drop=True)

    # Realistic missing values (simulating optional fields)
    missing_mask_name = np.random.binomial(1, 0.02, size=len(df)).astype(bool)
    df.loc[missing_mask_name & (df['verification_class'] != 'VERIFIED_PATTERN'), 'name_match'] = np.nan

    missing_mask_doc = np.random.binomial(1, 0.03, size=len(df)).astype(bool)
    df.loc[missing_mask_doc, 'document_quality'] = np.nan
    df.loc[missing_mask_doc, 'document_readability'] = np.nan

    return df

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.abspath(os.path.join(script_dir, '..'))
    dataset_dir = os.path.join(base_dir, 'dataset')
    os.makedirs(dataset_dir, exist_ok=True)

    print(f"[1/4] Generating {TOTAL_SAMPLES} synthetic identity verification records (seed={RANDOM_SEED})...")
    df = generate_synthetic_dataset(TOTAL_SAMPLES, RANDOM_SEED)

    full_csv = os.path.join(dataset_dir, 'pan_training.csv')
    df.to_csv(full_csv, index=False)
    print(f"[✓] Saved full dataset to {full_csv} ({len(df)} records)")

    # Stratified Train/Val/Test Split (70% Train, 15% Validation, 15% Test)
    print("[2/4] Performing stratified 70/15/15 train/validation/test split without leakage...")
    train_df, temp_df = train_test_split(
        df,
        test_size=0.30,
        random_state=RANDOM_SEED,
        stratify=df['verification_class']
    )

    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=RANDOM_SEED,
        stratify=temp_df['verification_class']
    )

    train_path = os.path.join(dataset_dir, 'train.csv')
    val_path = os.path.join(dataset_dir, 'validation.csv')
    test_path = os.path.join(dataset_dir, 'test.csv')

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"[✓] Train split saved:      {len(train_df)} records (70%)")
    print(f"[✓] Validation split saved: {len(val_df)} records (15%)")
    print(f"[✓] Test split saved:       {len(test_df)} records (15%)")

    # Invariant assertion
    bad_verified = df[(df['verification_class'] == 'VERIFIED_PATTERN') & (df['pan_format_valid'] == 0)]
    assert len(bad_verified) == 0, "Invariant violation: pan_format_valid=0 in VERIFIED_PATTERN!"
    print("[✓] Logical invariants verified: ZERO invalid PAN formats in VERIFIED_PATTERN.")

if __name__ == '__main__':
    main()
