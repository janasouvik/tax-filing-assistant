import * as ort from 'onnxruntime-node';
import path from 'path';
import fs from 'fs';

export type ClassificationStatus = 'CLASSIFIED' | 'UNKNOWN' | 'ERROR';

export type PanVerificationClass = 'VERIFIED_PATTERN' | 'REJECTED_PATTERN' | 'MANUAL_REVIEW' | 'UNKNOWN' | 'ERROR';

export interface PanSubmissionFeatures {
  pan?: string | null;
  pan_format_valid?: number | boolean;
  name_match?: number | null;
  dob_match?: number | boolean | null;
  applicant_type?: string | null;
  name_completeness?: number | null;
  dob_format_valid?: number | boolean | null;
  pan_field_present?: number | boolean | null;
  identity_details_consistent?: number | boolean | null;
  document_quality?: number | null;
  document_readability?: number | null;
  duplicate_submission?: number | boolean | null;
  provider_response_available?: number | boolean | null;
  provider_response_status?: string | null;
  previous_verification_attempts?: number | null;
  data_completeness?: number | null;
}

export interface PanClassificationResult {
  classificationStatus: ClassificationStatus;
  predictedClass: PanVerificationClass;
  probabilities: {
    VERIFIED_PATTERN: number;
    REJECTED_PATTERN: number;
    MANUAL_REVIEW: number;
  };
  confidence: number;
  riskScore: number;
  recommendation: 'PROCEED_AUTOMATICALLY' | 'FLAG_FOR_MANUAL_REVIEW' | 'REQUIRE_DOCUMENTS';
  isSyntheticModel: true;
  validationErrors?: string[];
  errorMessage?: string;
  notice: string;
}

interface ModelMetadata {
  model_name: string;
  input_tensor_name: string;
  input_vector_dimension: number;
  numerical_features: Record<string, { impute_median: number; scale: number }>;
  categorical_categories: {
    applicant_type: string[];
    provider_response_status: string[];
  };
  target_classes: ('VERIFIED_PATTERN' | 'REJECTED_PATTERN' | 'MANUAL_REVIEW')[];
}

export const REQUIRED_FEATURE_KEYS = [
  'pan_format_valid',
  'name_match',
  'dob_match',
  'applicant_type',
  'name_completeness',
  'dob_format_valid',
  'pan_field_present',
  'identity_details_consistent',
  'document_quality',
  'document_readability',
  'duplicate_submission',
  'provider_response_available',
  'provider_response_status',
  'previous_verification_attempts',
  'data_completeness',
] as const;

export const SUPPORTED_APPLICANT_TYPES = [
  'INDIVIDUAL',
  'COMPANY',
  'FIRM',
  'HUF',
  'AOP',
  'TRUST',
] as const;

export const SUPPORTED_PROVIDER_STATUSES = [
  'SUCCESS',
  'FAILED',
  'NOT_FOUND',
  'TIMEOUT',
  'PENDING',
] as const;

export class PanPatternClassifierService {
  private static session: ort.InferenceSession | null = null;
  private static metadata: ModelMetadata | null = null;
  private static initPromise: Promise<void> | null = null;

  public static async getSession(customPath?: string): Promise<{ session: ort.InferenceSession; metadata: ModelMetadata }> {
    if (customPath) {
      if (!fs.existsSync(customPath)) {
        throw new Error(`Model file not found at specified path: ${customPath}`);
      }
      const metaPath = path.join(path.dirname(customPath), 'model_metadata.json');
      if (!fs.existsSync(metaPath)) {
        throw new Error(`Model metadata not found at: ${metaPath}`);
      }
      const rawMeta = fs.readFileSync(metaPath, 'utf-8');
      const metadata = JSON.parse(rawMeta);
      const session = await ort.InferenceSession.create(customPath);
      return { session, metadata };
    }

    if (this.session && this.metadata) {
      return { session: this.session, metadata: this.metadata };
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        const baseMlDir = path.resolve(process.cwd(), 'ml', 'pan-classifier', 'models');
        const onnxPath = path.join(baseMlDir, 'best_model.onnx');
        const metaPath = path.join(baseMlDir, 'model_metadata.json');

        if (!fs.existsSync(onnxPath) || !fs.existsSync(metaPath)) {
          throw new Error(`ONNX model or metadata missing at ${baseMlDir}. Run python training scripts first.`);
        }

        const rawMeta = fs.readFileSync(metaPath, 'utf-8');
        this.metadata = JSON.parse(rawMeta);
        this.session = await ort.InferenceSession.create(onnxPath);
      })();
    }

    await this.initPromise;
    return { session: this.session!, metadata: this.metadata! };
  }

  /**
   * Validates the strict 15-feature contract and checks for missing, unsupported, or contradictory features.
   */
  public static validateContract(features: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!features || typeof features !== 'object') {
      return { isValid: false, errors: ['Submission features object is missing or invalid'] };
    }

    // 1. Missing required features check
    for (const key of REQUIRED_FEATURE_KEYS) {
      const val = features[key];
      if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
        errors.push(`Missing required feature: '${key}'`);
      }
    }

    // 2. Missing PAN check: if pan_field_present is 0 or false, or pan is empty
    if (
      features.pan_field_present === 0 ||
      features.pan_field_present === false ||
      (typeof features.pan === 'string' && features.pan.trim() === '')
    ) {
      errors.push('PAN field is missing or empty. PAN must be present for classification.');
    }

    // 3. Supported applicant_type check
    if (features.applicant_type !== undefined && features.applicant_type !== null) {
      const normalizedAppType = String(features.applicant_type).trim().toUpperCase();
      if (!SUPPORTED_APPLICANT_TYPES.includes(normalizedAppType as any)) {
        errors.push(
          `Unsupported applicant_type: '${features.applicant_type}'. Allowed values: ${SUPPORTED_APPLICANT_TYPES.join(', ')}.`
        );
      }
    }

    // 4. Supported provider_response_status check
    if (features.provider_response_status !== undefined && features.provider_response_status !== null) {
      const normalizedStatus = String(features.provider_response_status).trim().toUpperCase();
      if (!SUPPORTED_PROVIDER_STATUSES.includes(normalizedStatus as any)) {
        errors.push(
          `Unsupported provider_response_status: '${features.provider_response_status}'. Allowed values: ${SUPPORTED_PROVIDER_STATUSES.join(', ')}.`
        );
      }
    }

    // 5. Contradictory features detection
    const provAvail = Number(features.provider_response_available);
    const provStatus = String(features.provider_response_status || '').trim().toUpperCase();
    if (provAvail === 0 && provStatus === 'SUCCESS') {
      errors.push('Contradictory features: provider_response_available is 0 but provider_response_status is SUCCESS.');
    }

    const panPresent = Number(features.pan_field_present);
    const panValid = Number(features.pan_format_valid);
    if (panPresent === 0 && panValid === 1) {
      errors.push('Contradictory features: pan_field_present is 0 but pan_format_valid is 1.');
    }

    const identConsistent = Number(features.identity_details_consistent);
    if (panValid === 0 && identConsistent === 1) {
      errors.push('Contradictory features: pan_format_valid is 0 but identity_details_consistent is 1.');
    }

    const docQuality = Number(features.document_quality);
    const docRead = Number(features.document_readability);
    if (!isNaN(docQuality) && !isNaN(docRead) && docQuality < 0.2 && docRead > 0.9) {
      errors.push('Contradictory features: document_quality is below 0.20 but document_readability is above 0.90.');
    }

    // 6. Range checks
    if (!isNaN(docQuality) && (docQuality < 0 || docQuality > 1)) {
      errors.push('document_quality must be between 0.0 and 1.0.');
    }
    if (!isNaN(docRead) && (docRead < 0 || docRead > 1)) {
      errors.push('document_readability must be between 0.0 and 1.0.');
    }
    const nameMatch = Number(features.name_match);
    if (!isNaN(nameMatch) && (nameMatch < 0 || nameMatch > 1)) {
      errors.push('name_match must be between 0.0 and 1.0.');
    }
    const nameComp = Number(features.name_completeness);
    if (!isNaN(nameComp) && (nameComp < 0 || nameComp > 1)) {
      errors.push('name_completeness must be between 0.0 and 1.0.');
    }
    const dataComp = Number(features.data_completeness);
    if (!isNaN(dataComp) && (dataComp < 0 || dataComp > 1)) {
      errors.push('data_completeness must be between 0.0 and 1.0.');
    }
    const prevAttempts = Number(features.previous_verification_attempts);
    if (!isNaN(prevAttempts) && prevAttempts < 0) {
      errors.push('previous_verification_attempts must be non-negative.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transforms input submission features into the exact 24-dimensional normalized float tensor
   * matching the Scikit-learn ColumnTransformer pipeline.
   */
  public static buildFeatureVector(features: PanSubmissionFeatures, metadata: ModelMetadata): Float32Array {
    const vector = new Float32Array(metadata.input_vector_dimension);
    const numKeys = Object.keys(metadata.numerical_features);

    // 1. Process 13 numerical features
    numKeys.forEach((key, index) => {
      const config = metadata.numerical_features[key];
      const rawVal = (features as any)[key];

      let numericVal: number;
      if (rawVal === undefined || rawVal === null || (typeof rawVal === 'number' && isNaN(rawVal))) {
        numericVal = config.impute_median;
      } else if (typeof rawVal === 'boolean') {
        numericVal = rawVal ? 1.0 : 0.0;
      } else {
        numericVal = Number(rawVal);
      }

      // Scale (StandardScaler with with_mean=False scales by 1/scale)
      vector[index] = numericVal / (config.scale || 1.0);
    });

    // 2. Process Categorical applicant_type (one-hot vector of length 6)
    let offset = numKeys.length;
    const applicantType = (features.applicant_type || 'INDIVIDUAL').toUpperCase();
    const appCategories = metadata.categorical_categories.applicant_type;
    appCategories.forEach((cat, i) => {
      vector[offset + i] = cat === applicantType ? 1.0 : 0.0;
    });
    offset += appCategories.length;

    // 3. Process Categorical provider_response_status (one-hot vector of length 5)
    const provStatus = (features.provider_response_status || 'PENDING').toUpperCase();
    const provCategories = metadata.categorical_categories.provider_response_status;
    provCategories.forEach((cat, i) => {
      vector[offset + i] = cat === provStatus ? 1.0 : 0.0;
    });

    return vector;
  }

  /**
   * Executes local ONNX inference on identity verification submission features.
   * Returns CLASSIFIED on valid inputs, UNKNOWN on contract failures or contradictory inputs,
   * and ERROR on runtime/model loading failures.
   */
  public static async classify(
    features: PanSubmissionFeatures,
    options?: { modelPath?: string; simulateException?: boolean }
  ): Promise<PanClassificationResult> {
    // 1. Validate Feature Contract
    const validation = this.validateContract(features);
    if (!validation.isValid) {
      return {
        classificationStatus: 'UNKNOWN',
        predictedClass: 'UNKNOWN',
        probabilities: {
          VERIFIED_PATTERN: 0,
          REJECTED_PATTERN: 0,
          MANUAL_REVIEW: 0,
        },
        confidence: 0,
        riskScore: 1.0,
        recommendation: 'FLAG_FOR_MANUAL_REVIEW',
        isSyntheticModel: true,
        validationErrors: validation.errors,
        notice:
          'Input features could not be classified due to missing, invalid, or contradictory inputs. System returned UNKNOWN state.',
      };
    }

    // 2. Execute Model Inference
    try {
      if (options?.simulateException) {
        throw new Error('Simulated ONNX runtime exception for error handling verification');
      }

      const { session, metadata } = await this.getSession(options?.modelPath);

      const floatVector = this.buildFeatureVector(features, metadata);
      const inputTensor = new ort.Tensor('float32', floatVector, [1, metadata.input_vector_dimension]);

      const feeds: Record<string, ort.Tensor> = {};
      feeds[metadata.input_tensor_name] = inputTensor;

      const outputMap = await session.run(feeds);

      const rawLabel = outputMap.label
        ? (outputMap.label.data[0] as 'VERIFIED_PATTERN' | 'REJECTED_PATTERN' | 'MANUAL_REVIEW')
        : 'MANUAL_REVIEW';
      const rawProbs = outputMap.probabilities
        ? Array.from(outputMap.probabilities.data as Float32Array)
        : [0.33, 0.33, 0.34];

      // Map probabilities to named target classes
      const classProbs: Record<'VERIFIED_PATTERN' | 'REJECTED_PATTERN' | 'MANUAL_REVIEW', number> = {
        MANUAL_REVIEW: 0,
        REJECTED_PATTERN: 0,
        VERIFIED_PATTERN: 0,
      };

      metadata.target_classes.forEach((cls, i) => {
        classProbs[cls] = Math.round((rawProbs[i] || 0) * 1000) / 1000;
      });

      let finalLabel: PanVerificationClass = rawLabel;
      const isPanValid = features.pan_format_valid === 1 || features.pan_format_valid === true;

      // 3. Strict Invariant Guard: Invalid PAN format can NEVER produce VERIFIED_PATTERN
      if (!isPanValid) {
        if (finalLabel === 'VERIFIED_PATTERN') {
          console.warn(
            '[Invariant Guard] Intercepted illegal VERIFIED_PATTERN prediction for invalid PAN format. Forcing REJECTED_PATTERN.'
          );
          finalLabel = 'REJECTED_PATTERN';
        }
      }

      const confidence = classProbs[finalLabel as keyof typeof classProbs] || 0.9;
      // Risk score: combined probability of rejection or manual review necessity
      const riskScore = Math.round((classProbs.REJECTED_PATTERN + classProbs.MANUAL_REVIEW * 0.5) * 1000) / 1000;

      let recommendation: PanClassificationResult['recommendation'];
      if (finalLabel === 'VERIFIED_PATTERN' && confidence >= 0.85 && isPanValid) {
        recommendation = 'PROCEED_AUTOMATICALLY';
      } else if (finalLabel === 'REJECTED_PATTERN') {
        recommendation = 'REQUIRE_DOCUMENTS';
      } else {
        recommendation = 'FLAG_FOR_MANUAL_REVIEW';
      }

      return {
        classificationStatus: 'CLASSIFIED',
        predictedClass: finalLabel,
        probabilities: classProbs,
        confidence,
        riskScore,
        recommendation,
        isSyntheticModel: true,
        notice:
          'TaxPilot Diagnostic Model: Synthetic-trained pattern classifier for operational triage. Authoritative PAN identity status is verified strictly via Setu / ERI gateway.',
      };
    } catch (error: any) {
      return {
        classificationStatus: 'ERROR',
        predictedClass: 'ERROR',
        probabilities: {
          VERIFIED_PATTERN: 0,
          REJECTED_PATTERN: 0,
          MANUAL_REVIEW: 0,
        },
        confidence: 0,
        riskScore: 1.0,
        recommendation: 'FLAG_FOR_MANUAL_REVIEW',
        isSyntheticModel: true,
        errorMessage: error instanceof Error ? error.message : String(error),
        notice: 'Inference runtime encountered an error. System returned ERROR state.',
      };
    }
  }
}
