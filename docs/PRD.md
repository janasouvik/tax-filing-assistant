# TaxPilot — Product Requirements Document

## Product
TaxPilot is an automated tax-filing assistant for **Individuals and SMEs**. Existing frontend: **React + TypeScript**. Backend: **Node.js + Express + TypeScript**, database: **PostgreSQL + Prisma**.

**Core principle:** Rule Engine calculates → AI explains → Validation checks → User reviews → User approves.

## Users
### Individual
Profile, tax return, income, deductions/investments, documents, tax calculation, regime comparison where applicable, tax savings, validation, filing readiness, Tax Copilot, review and approval.

### SME
Business profile, revenue, expenses, transactions, invoices, financial documents, tax calculation, GST/TDS/compliance tracking, tax savings, reconciliation, validation, filing readiness, Tax Copilot, review and approval.

## Main Workflow
```text
User → React Dashboard → Workspace → Documents/Financial Data
→ OCR + Extraction → Structured Data → Deterministic Tax Engine
→ Validation/Reconciliation → Issues + Readiness → Tax Copilot
→ Final Review → Explicit User Approval
```

## Core Requirements
- Secure authentication and workspace isolation.
- Individual and SME workspaces.
- Document upload, secure storage, OCR, classification, extraction and verification.
- Individual income/deduction/investment data.
- SME revenue/expense/transaction/invoice data.
- Versioned deterministic tax rules.
- Explainable tax calculation lines and source traceability.
- Validation for missing data, discrepancies, duplicates and rule inconsistencies.
- Tax-saving recommendations based on explicit eligibility rules.
- RAG-based contextual Tax Copilot.
- Review and explicit approval workflow.
- Audit logging.
- Dashboard APIs for both Individual and SME.

## Document Pipeline
```text
Upload → File Validation → Object Storage → OCR → Classification
→ Field Extraction → Normalization → Source Mapping → Validation → User Verification
```
Long-running processing must be asynchronous.

## Tax Pipeline
```text
Verified Data + Versioned Rules → Rule Evaluation → Calculation Lines
→ Taxable Income/Profit → Tax Liability → TDS/Advance Tax → Refund/Payable
```
The LLM must never be authoritative for final tax numbers.

## Validation
Check schema validity, missing fields, duplicate records, cross-document mismatches, calculation inconsistencies and compliance conditions. Severity: `INFO`, `WARNING`, `CRITICAL`. Unresolved CRITICAL issues block approval.

## Tax Copilot
Copilot can explain calculations, deductions, documents, validation issues and tax concepts. It must use actual workspace data and sources.

It must NOT invent numbers, override the tax engine, verify documents, resolve critical issues automatically, approve returns, or claim government filing without a real integration.

## Dashboards
### Individual
Readiness, income, deductions, estimated tax/refund, tax savings, issues, documents, Copilot and return progress.

### SME
Revenue, expenses, taxable profit, estimated tax, filing readiness, compliance, issues, documents, tax-saving opportunities, financial trends and Copilot.

## Filing Lifecycle
```text
DRAFT → PROCESSING → VALIDATION_REQUIRED → READY_FOR_REVIEW
→ USER_REVIEW → APPROVED → FILED
```
`FILED` is allowed only when a real filing integration confirms submission.

## Approval
Require authenticated user, workspace ownership, completed processing/calculation/validation, required data/documents, and no unresolved CRITICAL issues. Record user, return, timestamp, IP and approval hash.

## Security
JWT access/refresh authentication, password hashing, workspace authorization, private object storage, signed URLs, rate limiting, CORS, secure headers, audit logs, environment secrets, and no sensitive credentials/tokens/document contents in logs.

## Acceptance Criteria
- React authenticates successfully.
- Individual and SME dashboards use real backend data.
- CRUD and document workflows work.
- PostgreSQL persists structured data.
- Tax calculations are deterministic and reproducible.
- Validation creates and resolves issues.
- Copilot has contextual source-aware APIs.
- Review/approval works and blocks unsafe approval.
- Unauthorized workspace access is blocked.
- Tests/lint pass and no secrets are committed.
- Existing frontend UI is preserved.

## Definition of Done
Every feature requires implementation, database migration, validation, authorization, tests, frontend integration, error/loading handling and documentation.
