#!/usr/bin/env python3
"""
TaxPilot PAN Identity Classification Pipeline — Stage 1
Preprocessing & Feature Pipeline Definition

Builds a leak-free scikit-learn ColumnTransformer pipeline for:
  - Numerical imputation & scaling
  - Categorical imputation & one-hot encoding
  - Target label encoding
"""

import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder

NUMERICAL_FEATURES = [
    'pan_format_valid',
    'name_match',
    'dob_match',
    'name_completeness',
    'dob_format_valid',
    'pan_field_present',
    'identity_details_consistent',
    'document_quality',
    'document_readability',
    'duplicate_submission',
    'provider_response_available',
    'previous_verification_attempts',
    'data_completeness',
]

CATEGORICAL_FEATURES = [
    'applicant_type',
    'provider_response_status',
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = 'verification_class'
TARGET_CLASSES = ['MANUAL_REVIEW', 'REJECTED_PATTERN', 'VERIFIED_PATTERN']

def build_preprocessor() -> ColumnTransformer:
    """Creates an unfitted Scikit-Learn ColumnTransformer."""
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler(with_mean=False)), # with_mean=False preserves sparsity & ONNX export stability
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES),
        ]
    )

    return preprocessor

def get_feature_names(preprocessor: ColumnTransformer) -> list:
    """Extracts transformed feature names after fitting."""
    feature_names = []
    # Numerical
    feature_names.extend(NUMERICAL_FEATURES)
    # Categorical OneHot
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['encoder']
    cat_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES)
    feature_names.extend(list(cat_names))
    return feature_names

if __name__ == '__main__':
    print("Preprocess module ready.")
    print("Numerical features:", len(NUMERICAL_FEATURES))
    print("Categorical features:", len(CATEGORICAL_FEATURES))
    print("Target classes:", TARGET_CLASSES)

