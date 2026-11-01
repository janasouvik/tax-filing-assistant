#!/usr/bin/env python3
"""
TaxPilot PAN Identity Classification Pipeline — Stage 1 & 2
Model Evaluation & Diagnostic Reporting Script

Evaluates the selected model on the held-out test.csv dataset:
  - Generates comprehensive classification_report.txt
  - Plots and saves confusion_matrix.png
  - Computes security-critical FAR & FRR
  - Demonstrates sample predictions on unseen synthetic test cases
"""

import os
import joblib
import pandas as pd
import numpy as np

# Set non-interactive backend for headless execution
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from preprocess import (
    ALL_FEATURE_COLUMNS,
    TARGET_COLUMN,
    TARGET_CLASSES,
)
from train import compute_security_rates

def plot_and_save_confusion_matrix(cm, classes, output_path, title='PAN Pattern Confusion Matrix'):
    plt.figure(figsize=(7, 6))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title(title, fontsize=12, fontweight='bold', pad=14)
    plt.colorbar()

    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=25, ha='right', fontsize=9)
    plt.yticks(tick_marks, classes, fontsize=9)

    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(
                j, i, format(cm[i, j], 'd'),
                horizontalalignment="center",
                verticalalignment="center",
                color="white" if cm[i, j] > thresh else "black",
                fontsize=11,
                fontweight='semibold'
            )

    plt.tight_layout()
    plt.ylabel('Ground Truth Label', fontsize=10, fontweight='bold')
    plt.xlabel('Model Predicted Label', fontsize=10, fontweight='bold')
    plt.savefig(output_path, dpi=200, bbox_inches='tight')
    plt.close()

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.abspath(os.path.join(script_dir, '..'))
    dataset_dir = os.path.join(base_dir, 'dataset')
    models_dir = os.path.join(base_dir, 'models')
    reports_dir = os.path.join(base_dir, 'reports')

    test_path = os.path.join(dataset_dir, 'test.csv')
    best_model_path = os.path.join(models_dir, 'best_model.pkl')

    if not os.path.exists(test_path):
        raise FileNotFoundError(f"Test dataset not found at {test_path}")
    if not os.path.exists(best_model_path):
        raise FileNotFoundError(f"Trained model not found at {best_model_path}")

    print("[1/4] Loading held-out test dataset and trained model...")
    test_df = pd.read_csv(test_path)
    model_pipeline = joblib.load(best_model_path)

    X_test = test_df[ALL_FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]

    print(f"      Test set size: {len(X_test)} samples")

    # Generate Predictions
    print("[2/4] Running inference across test partition...")
    y_pred = model_pipeline.predict(X_test)

    # Core Metrics
    acc = accuracy_score(y_test, y_pred)
    macro_prec = precision_score(y_test, y_pred, average='macro')
    macro_rec = recall_score(y_test, y_pred, average='macro')
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    weighted_f1 = f1_score(y_test, y_pred, average='weighted')

    cm = confusion_matrix(y_test, y_pred, labels=TARGET_CLASSES)
    rates = compute_security_rates(y_test, y_pred, TARGET_CLASSES)
    clf_rep_str = classification_report(y_test, y_pred, labels=TARGET_CLASSES, digits=4)

    # Write textual evaluation report
    report_file = os.path.join(reports_dir, 'classification_report.txt')
    with open(report_file, 'w') as f:
        f.write("=" * 72 + "\n")
        f.write("TAXPILOT IDENTITY ML CLASSIFIER — TEST SET EVALUATION REPORT\n")
        f.write("Synthetic-Data Trained Diagnostic Prototype (Stage 1 & 2)\n")
        f.write("=" * 72 + "\n\n")
        f.write(f"Model Architecture:       {model_pipeline.named_steps['classifier'].__class__.__name__}\n")
        f.write(f"Test Partition Size:      {len(X_test)} samples (strictly held-out)\n")
        f.write(f"Overall Accuracy:         {acc:.4f} ({acc*100:.2f}%)\n")
        f.write(f"Macro Precision:          {macro_prec:.4f}\n")
        f.write(f"Macro Recall:             {macro_rec:.4f}\n")
        f.write(f"Macro F1-Score:           {macro_f1:.4f}\n")
        f.write(f"Weighted F1-Score:        {weighted_f1:.4f}\n\n")
        f.write("-" * 72 + "\n")
        f.write("SECURITY & RISK METRICS:\n")
        f.write("-" * 72 + "\n")
        f.write(f"False Acceptance Rate (FAR):  {rates['false_acceptance_rate']:.4f} ({rates['false_acceptance_rate']*100:.2f}%)\n")
        f.write(f"  - Non-verified samples misclassified as VERIFIED_PATTERN: {rates['false_acceptance_count']}\n")
        f.write(f"False Rejection Rate (FRR):   {rates['false_rejection_rate']:.4f} ({rates['false_rejection_rate']*100:.2f}%)\n")
        f.write(f"  - Verified samples misclassified as REJECTED_PATTERN:    {rates['false_rejection_count']}\n\n")
        f.write("-" * 72 + "\n")
        f.write("PER-CLASS CLASSIFICATION BREAKDOWN:\n")
        f.write("-" * 72 + "\n")
        f.write(clf_rep_str + "\n")
        f.write("-" * 72 + "\n")
        f.write("CONFUSION MATRIX:\n")
        f.write("-" * 72 + "\n")
        f.write(f"Labels: {TARGET_CLASSES}\n")
        f.write(np.array2string(cm) + "\n\n")
        f.write("=" * 72 + "\n")
        f.write("IMPORTANT DISCLAIMER:\n")
        f.write("This model was trained on synthetic data for offline verification pattern\n")
        f.write("triage and test bench architecture. Its accuracy metrics do NOT represent\n")
        f.write("real-world statutory PAN verification. Real PAN authentication must remain\n")
        f.write("authoritative via certified ERI / Setu providers.\n")
        f.write("=" * 72 + "\n")

    print(f"[3/4] Classification report written to {report_file}")

    # Plot Confusion Matrix
    cm_plot_path = os.path.join(reports_dir, 'confusion_matrix.png')
    plot_and_save_confusion_matrix(cm, TARGET_CLASSES, cm_plot_path)
    print(f"      Confusion matrix image saved to {cm_plot_path}")

    # Sample unseen predictions demonstration
    print("\n[4/4] Sample Predictions on Unseen Synthetic Test Records:")
    sample_indices = [0, 1, 2, 3, 4]
    for idx in sample_indices:
        rec = X_test.iloc[idx:idx+1]
        truth = y_test.iloc[idx]
        pred = model_pipeline.predict(rec)[0]
        probs = model_pipeline.predict_proba(rec)[0] if hasattr(model_pipeline, 'predict_proba') else None
        prob_str = f", Probs: {dict(zip(TARGET_CLASSES, np.round(probs, 3)))}" if probs is not None else ""
        print(f"  Sample #{idx:2d} -> Ground Truth: {truth:<16} | Predicted: {pred:<16} {prob_str}")

    print("\n[✓] Evaluation completed successfully.")

if __name__ == '__main__':
    main()

