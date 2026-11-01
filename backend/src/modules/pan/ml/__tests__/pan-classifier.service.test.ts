import { describe, it, expect } from 'vitest';
import { PanPatternClassifierService, PanSubmissionFeatures } from '../pan-classifier.service';

describe('PanPatternClassifierService — Rigorous Validation & ONNX Runtime Inference', () => {
  const baseValidFeatures: PanSubmissionFeatures = {
    pan_format_valid: 1,
    name_match: 0.98,
    dob_match: 1,
    applicant_type: 'INDIVIDUAL',
    name_completeness: 0.95,
    dob_format_valid: 1,
    pan_field_present: 1,
    identity_details_consistent: 1,
    document_quality: 0.92,
    document_readability: 0.94,
    duplicate_submission: 0,
    provider_response_available: 1,
    provider_response_status: 'SUCCESS',
    previous_verification_attempts: 0,
    data_completeness: 0.95,
  };

  // Case 1: Valid PAN format & complete features -> Real model prediction (VERIFIED_PATTERN)
  it('Case 1: correctly classifies clean submission with valid PAN as VERIFIED_PATTERN', async () => {
    const result = await PanPatternClassifierService.classify(baseValidFeatures);

    expect(result.classificationStatus).toBe('CLASSIFIED');
    expect(result.predictedClass).toBe('VERIFIED_PATTERN');
    expect(result.probabilities.VERIFIED_PATTERN).toBeGreaterThan(0.7);
    expect(result.riskScore).toBeLessThan(0.3);
    expect(result.recommendation).toBe('PROCEED_AUTOMATICALLY');
    expect(result.isSyntheticModel).toBe(true);
  });

  // Case 2: Invalid PAN format (e.g. ABC123) with high completeness -> REJECTED_PATTERN (Never VERIFIED_PATTERN)
  it('Case 2: strictly rejects invalid PAN format even with 100% data completeness', async () => {
    const invalidPanFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      pan_format_valid: 0, // Invalid PAN format (e.g. ABC123)
      identity_details_consistent: 0,
      name_completeness: 1.0,
      data_completeness: 1.0,
    };

    const result = await PanPatternClassifierService.classify(invalidPanFeatures);

    expect(result.classificationStatus).toBe('CLASSIFIED');
    expect(result.predictedClass).toBe('REJECTED_PATTERN');
    expect(result.predictedClass).not.toBe('VERIFIED_PATTERN');
    expect(result.recommendation).not.toBe('PROCEED_AUTOMATICALLY');
    expect(result.recommendation).toBe('REQUIRE_DOCUMENTS');
  });

  // Case 3: Missing PAN -> UNKNOWN
  it('Case 3: returns UNKNOWN state when PAN is missing or pan_field_present is 0', async () => {
    const missingPanFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      pan_field_present: 0,
    };

    const result = await PanPatternClassifierService.classify(missingPanFeatures);

    expect(result.classificationStatus).toBe('UNKNOWN');
    expect(result.predictedClass).toBe('UNKNOWN');
    expect(result.validationErrors).toBeDefined();
    expect(result.validationErrors!.some(e => e.includes('PAN'))).toBe(true);
  });

  // Case 4: Missing required feature -> UNKNOWN
  it('Case 4: returns UNKNOWN when a required feature (e.g. pan_format_valid) is omitted', async () => {
    const incompleteFeatures: any = { ...baseValidFeatures };
    delete incompleteFeatures.pan_format_valid;

    const result = await PanPatternClassifierService.classify(incompleteFeatures);

    expect(result.classificationStatus).toBe('UNKNOWN');
    expect(result.predictedClass).toBe('UNKNOWN');
    expect(result.validationErrors).toContain("Missing required feature: 'pan_format_valid'");
  });

  // Case 5: Unsupported applicant type -> UNKNOWN
  it('Case 5: returns UNKNOWN when applicant_type is unsupported (e.g. GOVERNMENT)', async () => {
    const unsupportedTypeFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      applicant_type: 'GOVERNMENT',
    };

    const result = await PanPatternClassifierService.classify(unsupportedTypeFeatures);

    expect(result.classificationStatus).toBe('UNKNOWN');
    expect(result.predictedClass).toBe('UNKNOWN');
    expect(result.validationErrors!.some(e => e.includes('Unsupported applicant_type'))).toBe(true);
  });

  // Case 6: Model file missing -> ERROR
  it('Case 6: returns ERROR when model file path is missing or invalid', async () => {
    const result = await PanPatternClassifierService.classify(baseValidFeatures, {
      modelPath: '/non/existent/path/model.onnx',
    });

    expect(result.classificationStatus).toBe('ERROR');
    expect(result.predictedClass).toBe('ERROR');
    expect(result.errorMessage).toBeDefined();
    expect(result.errorMessage).toContain('Model file not found');
  });

  // Case 7: ONNX inference exception -> ERROR
  it('Case 7: returns ERROR when ONNX runtime encounters an inference exception', async () => {
    const result = await PanPatternClassifierService.classify(baseValidFeatures, {
      simulateException: true,
    });

    expect(result.classificationStatus).toBe('ERROR');
    expect(result.predictedClass).toBe('ERROR');
    expect(result.errorMessage).toContain('Simulated ONNX runtime exception');
  });

  // Case 8: Contradictory features -> UNKNOWN
  it('Case 8: returns UNKNOWN when contradictory features are provided (prov_avail: 0, prov_status: SUCCESS)', async () => {
    const contradictoryFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      provider_response_available: 0,
      provider_response_status: 'SUCCESS',
    };

    const result = await PanPatternClassifierService.classify(contradictoryFeatures);

    expect(result.classificationStatus).toBe('UNKNOWN');
    expect(result.predictedClass).toBe('UNKNOWN');
    expect(result.validationErrors!.some(e => e.includes('Contradictory features'))).toBe(true);
  });

  // Case 9: Valid format with typo/ambiguous features -> MANUAL_REVIEW
  it('Case 9: classifies ambiguous submission (minor typo, moderate confidence) as MANUAL_REVIEW', async () => {
    const ambiguousFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      name_match: 0.62,
      name_completeness: 0.65,
      document_quality: 0.55,
      document_readability: 0.50,
      provider_response_status: 'PENDING',
      previous_verification_attempts: 2,
      data_completeness: 0.70,
    };

    const result = await PanPatternClassifierService.classify(ambiguousFeatures);

    expect(result.classificationStatus).toBe('CLASSIFIED');
    expect(result.predictedClass).toBe('MANUAL_REVIEW');
    expect(result.recommendation).toBe('FLAG_FOR_MANUAL_REVIEW');
  });

  // Case 10: Provider timeout -> ML predicts independently based on TIMEOUT status
  it('Case 10: maintains independence between ML triage and provider TIMEOUT status', async () => {
    const timeoutFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      provider_response_status: 'TIMEOUT',
    };

    const result = await PanPatternClassifierService.classify(timeoutFeatures);

    expect(result.classificationStatus).toBe('CLASSIFIED');
    // Model produces independent ML triage regardless of external provider timeout
    expect(['VERIFIED_PATTERN', 'MANUAL_REVIEW', 'REJECTED_PATTERN']).toContain(result.predictedClass);
  });

  // Case 11: Provider unavailable -> ML evaluates offline features independently
  it('Case 11: handles provider unavailable (prov_avail: 0, PENDING) independently', async () => {
    const provUnavailFeatures: PanSubmissionFeatures = {
      ...baseValidFeatures,
      provider_response_available: 0,
      provider_response_status: 'PENDING',
    };

    const result = await PanPatternClassifierService.classify(provUnavailFeatures);

    expect(result.classificationStatus).toBe('CLASSIFIED');
    expect(['MANUAL_REVIEW', 'VERIFIED_PATTERN']).toContain(result.predictedClass);
  });

  // Case 12: Same input submitted twice -> Exactly identical deterministic inference results
  it('Case 12: guarantees deterministic identical predictions for repeated executions', async () => {
    const run1 = await PanPatternClassifierService.classify(baseValidFeatures);
    const run2 = await PanPatternClassifierService.classify(baseValidFeatures);

    expect(run1.classificationStatus).toBe(run2.classificationStatus);
    expect(run1.predictedClass).toBe(run2.predictedClass);
    expect(run1.confidence).toBe(run2.confidence);
    expect(run1.riskScore).toBe(run2.riskScore);
    expect(run1.probabilities.VERIFIED_PATTERN).toBe(run2.probabilities.VERIFIED_PATTERN);
    expect(run1.probabilities.REJECTED_PATTERN).toBe(run2.probabilities.REJECTED_PATTERN);
    expect(run1.probabilities.MANUAL_REVIEW).toBe(run2.probabilities.MANUAL_REVIEW);
  });
});
