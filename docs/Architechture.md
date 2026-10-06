# TaxPilot — Architecture

## 1. High-Level Architecture
```text
USER
  ↓
REACT + TYPESCRIPT FRONTEND
  ├── Individual Dashboard
  ├── SME Dashboard
  ├── Documents
  ├── Tax Calculation / Savings
  ├── Validation / Issues
  ├── Compliance
  ├── Tax Copilot
  └── Review / Approval
  ↓ REST / JSON
NODE.JS + EXPRESS + TYPESCRIPT
  ├── Routes
  ├── Middleware
  ├── Controllers
  ├── Services
  └── Domain Modules
  ├──────────────┬────────────────┐
  ↓              ↓                ↓
POSTGRESQL   OBJECT STORAGE     REDIS
  │              │                │
  │              │             BullMQ
  │              │                ↓
  │              │          BACKGROUND WORKER
  │              │          ├── OCR
  │              │          ├── Extraction
  │              │          └── Processing
```

## 2. Layering
```text
React UI
 ↓
REST Routes
 ↓
Security / Validation Middleware
 ↓
Controllers
 ↓
Application Services
 ↓
Domain Modules
 ↓
Prisma
 ↓
PostgreSQL
```
Controllers stay thin. Business logic belongs in services/modules.

## 3. Backend Structure
```text
backend/src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── modules/
│   ├── auth/
│   ├── documents/
│   ├── extraction/
│   ├── taxEngine/
│   ├── validation/
│   ├── compliance/
│   ├── taxSavings/
│   └── copilot/
├── routes/
├── services/
├── types/
├── utils/
├── validators/
├── app.ts
└── server.ts
```

## 4. Individual Flow
```text
Individual User → Dashboard → Tax Return
→ Income / Deductions / Investments / Documents
→ OCR + Extraction → PostgreSQL
→ Deterministic Tax Engine → Validation
→ Issues + Readiness → Tax Copilot
→ Final Review → User Approval
```

## 5. SME Flow
```text
SME User → SME Dashboard → Business Profile
→ Revenue / Expenses / Transactions / Invoices / Compliance
→ Document Processing → PostgreSQL
→ Tax / Profit Calculation → Reconciliation + Validation
→ Issues + Readiness → Tax Savings → Tax Copilot
→ Final Review → User Approval
```

## 6. Document Pipeline
```text
React Upload
 ↓
POST /documents/upload
 ↓
File Validation
 ↓
S3/MinIO
 ↓
Document Metadata → PostgreSQL
 ↓
Redis/BullMQ
 ↓
Worker
 ↓
OCR → Classification → Field Extraction → Normalization
 ↓
Extracted Fields → PostgreSQL
 ↓
Validation → User Verification
```
The HTTP request must not wait for long OCR processing.

## 7. Tax Engine
```text
Verified Inputs + Versioned Rules
 ↓
Deterministic Rule Engine
 ↓
Calculation Lines
 ↓
Taxable Income / Profit
 ↓
Tax Liability
 ↓
TDS / Advance Tax
 ↓
Refund / Payable
```
AI is deliberately outside this authoritative calculation path.

## 8. Validation
```text
Documents + Extracted Fields + Financial Data + Tax Calculation + Rules
                              ↓
                       VALIDATION ENGINE
                              ↓
       ┌──────────┬──────────┬──────────┬──────────────┐
       ↓          ↓          ↓          ↓
     Schema     Missing     Cross       Tax/Compliance
     Checks     Data        Document    Rules
                           Checks
                              ↓
                     Validation Issues
                              ↓
                       Readiness Score
```

## 9. Copilot / RAG
```text
User Question
 ↓
Copilot API
 ↓
Context Builder
 ├── User/Workspace Data
 ├── Validated Tax Results
 ├── Relevant Documents
 └── Tax Knowledge Base
 ↓
Retriever → LLM → Answer + Sources
```
Copilot explains/retrieves. It does not replace deterministic services or user approval.

## 10. Source Traceability
```text
Document → Page → OCR / Extracted Field → Normalized Value
→ Income / Deduction / Expense → Calculation Line → Validation / Final Result
```
Every important number should be traceable to its source document/rule.

## 11. Authentication and Authorization
```text
Request
 ↓
CORS
 ↓
Rate Limit
 ↓
JWT Authentication
 ↓
Workspace Authorization
 ↓
Request Validation
 ↓
Controller
 ↓
Service
```
Every resource must verify authenticated user → workspace ownership → resource ownership.

## 12. Database Relationships
```text
User
 └── Workspace
      ├── Business
      ├── TaxReturn
      │    ├── IncomeEntry
      │    ├── Deduction
      │    ├── Document
      │    │    ├── DocumentPage
      │    │    └── ExtractedField
      │    ├── TaxCalculation
      │    │    └── TaxCalculationLine
      │    ├── ValidationIssue
      │    ├── TaxSaving
      │    ├── Review
      │    └── Approval
      ├── Expense
      ├── Transaction
      ├── ComplianceItem
      └── AuditLog
```

## 13. Dashboard Aggregation
### Individual
```text
GET /api/v1/dashboard/individual
 ↓
Dashboard Service
 ├── Return
 ├── Financial Summary
 ├── Tax Calculation
 ├── Savings
 ├── Issues
 ├── Documents
 └── Copilot
 ↓
Aggregated Response → React Dashboard
```

### SME
```text
GET /api/v1/dashboard/sme
 ↓
Dashboard Service
 ├── Business
 ├── Revenue
 ├── Expenses
 ├── Profit
 ├── Tax
 ├── Compliance
 ├── Savings
 ├── Issues
 ├── Documents
 └── Copilot
 ↓
Aggregated Response → React SME Dashboard
```

## 14. Review State Machine
```text
DRAFT
 ↓
PROCESSING
 ↓
VALIDATION_REQUIRED
 ↓
READY_FOR_REVIEW
 ↓
USER_REVIEW
 ├── issues found → VALIDATION_REQUIRED
 └── approved → APPROVED → FILED*
```
`FILED*` only after a real filing integration confirms submission.

## 15. Security
Private documents live in private object storage and are accessed through short-lived authorized/signed URLs. Never expose storage credentials to React.

Audit important events:
```text
LOGIN
DOCUMENT_UPLOAD
DOCUMENT_VERIFY
DOCUMENT_DELETE
CALCULATION
VALIDATION
ISSUE_RESOLUTION
COPILOT_REQUEST
REVIEW
APPROVAL
SETTINGS_CHANGE
```

## 16. Deployment / Local Architecture
```text
Browser → React → Node/Express API
                    ├── PostgreSQL
                    ├── Redis
                    ├── S3/MinIO
                    └── OCR/LLM Providers

Redis → Worker → OCR / Extraction / Processing
```

## 17. Implementation Order
1. Inspect existing React frontend and API contracts.
2. PostgreSQL + Prisma.
3. Authentication.
4. Workspace isolation.
5. Individual/SME profiles.
6. Documents/storage.
7. Financial CRUD.
8. Deterministic tax engine.
9. Validation.
10. Dashboard aggregation APIs.
11. Tax savings.
12. Copilot/RAG abstraction.
13. Review/approval.
14. Audit/security hardening.
15. Tests.
16. React integration.
17. Docker/deployment.

## 18. Non-Negotiable Rules
- React is presentation.
- Node/Express is the API/application layer.
- PostgreSQL is the source of truth for structured data.
- Object storage is the source of truth for document binaries.
- Tax Engine is authoritative for calculations.
- Validation Engine is authoritative for readiness/issues.
- AI explains/retrieves; AI does not decide final tax values.
- Every private resource requires authorization.
- Important calculations must be traceable.
- Important user actions must be auditable.
- Never claim government filing/verification without a real integration.
- Preserve the existing React UI and integrate the backend to it.
