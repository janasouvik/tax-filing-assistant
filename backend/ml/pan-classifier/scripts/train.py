#!/usr/bin/env python3
"""
TaxPilot PAN Identity Classification Pipeline — Stage 1
Model Training & Model Comparison Script

Trains:
  1. Decision Tree Classifier
  2. Random Forest Classifier
Compares metrics on the validation dataset and saves both trained models.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from preprocess import (
    build_preprocessor,
    ALL_FEATURE_COLUMNS,
    TARGET_COLUMN,
    TARGET_CLASSES,
)

RANDOM_SEED = 42

def compute_security_rates(y_true, y_pred, labels):
    """
    Computes False Acceptance Rate (FAR) and False Rejection Rate (FRR):
      - FAR: True non-verified (REJECTED or MANUAL_REVIEW) classified as VERIFIED_PATTERN.
      - FRR: True VERIFIED_PATTERN classified as REJECTED_PATTERN.
    """
    # Find index of VERIFIED_PATTERN and REJECTED_PATTERN
    idx_verified = labels.index('VERIFIED_PATTERN')
    idx_rejected = labels.index('REJECTED_PATTERN')

    y_true_arr = np.array(y_true)
    y_pred_arr = np.array(y_pred)

    # True non-verified
    non_verified_mask = (y_true_arr != 'VERIFIED_PATTERN')
    total_non_verified = np.sum(non_verified_mask)
    false_accepts = np.sum((y_pred_arr == 'VERIFIED_PATTERN') & non_verified_mask)
    far = float(false_accepts / total_non_verified) if total_non_verified > 0 else 0.0

    # True verified
    verified_mask = (y_true_arr == 'VERIFIED_PATTERN')
    total_verified = np.sum(verified_mask)
    false_rejects = np.sum((y_pred_arr == 'REJECTED_PATTERN') & verified_mask)
    frr = float(false_rejects / total_verified) if total_verified > 0 else 0.0

    return {
        'false_acceptance_rate': round(far, 4),
        'false_rejection_rate': round(frr, 4),
        'false_acceptance_count': int(false_accepts),
        'false_rejection_count': int(false_rejects),
    }

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.abspath(os.path.join(script_dir, '..'))
    dataset_dir = os.path.join(base_dir, 'dataset')
    models_dir = os.path.join(base_dir, 'models')
    reports_dir = os.path.join(base_dir, 'reports')

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    train_path = os.path.join(dataset_dir, 'train.csv')
    val_path = os.path.join(dataset_dir, 'validation.csv')

    if not os.path.exists(train_path) or not os.path.exists(val_path):
        raise FileNotFoundError("Training/validation CSVs not found. Please run generate_dataset.py first.")

    print("[1/4] Loading training and validation partitions...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)

    X_train = train_df[ALL_FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]

    X_val = val_df[ALL_FEATURE_COLUMNS]
    y_val = val_df[TARGET_COLUMN]

    print(f"      Train samples: {len(X_train)}, Validation samples: {len(X_val)}")

    # 1. Decision Tree Pipeline
    print("[2/4] Training Decision Tree Classifier...")
    dt_pipeline = Pipeline([
        ('preprocessor', build_preprocessor()),
        ('classifier', DecisionTreeClassifier(
            max_depth=6,
            min_samples_split=6,
            min_samples_leaf=4,
            random_state=RANDOM_SEED,
            class_weight='balanced',
        )),
    ])
    dt_pipeline.fit(X_train, y_train)

    dt_val_pred = dt_pipeline.predict(X_val)
    dt_acc = accuracy_score(y_val, dt_val_pred)
    dt_f1 = f1_score(y_val, dt_val_pred, average='weighted')
    dt_rates = compute_security_rates(y_val, dt_val_pred, TARGET_CLASSES)

    print(f"      Decision Tree Val Accuracy: {dt_acc:.4f}, Weighted F1: {dt_f1:.4f}, FAR: {dt_rates['false_acceptance_rate']}")

    # 2. Random Forest Pipeline
    print("[3/4] Training Random Forest Classifier...")
    rf_pipeline = Pipeline([
        ('preprocessor', build_preprocessor()),
        ('classifier', RandomForestClassifier(
            n_estimators=120,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=RANDOM_SEED,
            class_weight='balanced',
            n_jobs=-1,
        )),
    ])
    rf_pipeline.fit(X_train, y_train)

    rf_val_pred = rf_pipeline.predict(X_val)
    rf_acc = accuracy_score(y_val, rf_val_pred)
    rf_f1 = f1_score(y_val, rf_val_pred, average='weighted')
    rf_rates = compute_security_rates(y_val, rf_val_pred, TARGET_CLASSES)

    print(f"      Random Forest Val Accuracy: {rf_acc:.4f}, Weighted F1: {rf_f1:.4f}, FAR: {rf_rates['false_acceptance_rate']}")

    # Save Models
    dt_model_path = os.path.join(models_dir, 'decision_tree.pkl')
    rf_model_path = os.path.join(models_dir, 'random_forest.pkl')

    joblib.dump(dt_pipeline, dt_model_path)
    joblib.dump(rf_pipeline, rf_model_path)
    print(f"[✓] Saved {dt_model_path}")
    print(f"[✓] Saved {rf_model_path}")

    # Model Selection (prefer higher F1 and lower FAR)
    best_model_name = "RandomForest" if (rf_f1 >= dt_f1 and rf_rates['false_acceptance_rate'] <= dt_rates['false_acceptance_rate'] + 0.01) else "DecisionTree"
    best_pipeline = rf_pipeline if best_model_name == "RandomForest" else dt_pipeline

    best_pipeline_path = os.path.join(models_dir, 'best_model.pkl')
    joblib.dump(best_pipeline, best_pipeline_path)

    # Comparison summary
    comparison = {
        'selected_model': best_model_name,
        'selection_criteria': 'Validation Weighted F1-score & Minimizing False Acceptance Rate (FAR)',
        'decision_tree': {
            'validation_accuracy': round(float(dt_acc), 4),
            'validation_weighted_f1': round(float(dt_f1), 4),
            'validation_macro_precision': round(float(precision_score(y_val, dt_val_pred, average='macro')), 4),
            'validation_macro_recall': round(float(recall_score(y_val, dt_val_pred, average='macro')), 4),
            'security_metrics': dt_rates,
        },
        'random_forest': {
            'validation_accuracy': round(float(rf_acc), 4),
            'validation_weighted_f1': round(float(rf_f1), 4),
            'validation_macro_precision': round(float(precision_score(y_val, rf_val_pred, average='macro')), 4),
            'validation_macro_recall': round(float(recall_score(y_val, rf_val_pred, average='macro')), 4),
            'security_metrics': rf_rates,
        },
    }

    comp_path = os.path.join(reports_dir, 'model_comparison.json')
    with open(comp_path, 'w') as f:
        json.dump(comparison, f, indent=2)

    print(f"[4/4] Model Comparison written to {comp_path}")
    print(f"      Selected Winner: {best_model_name}")

if __name__ == '__main__':
    main()

