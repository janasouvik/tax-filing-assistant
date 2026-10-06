# TaxPilot — Technical Requirements Document

## Stack
- Frontend: existing React + TypeScript
- Backend: Node.js LTS + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Auth: JWT + Argon2/bcrypt
- Logging: Pino
- Tests: Vitest/Jest + Supertest
- Async jobs: Redis + BullMQ where required
- Document storage: S3-compatible storage / MinIO locally
- API docs: OpenAPI/Swagger

## Existing Backend Structure
Follow the structure visible in the current project. Do not create a competing architecture:
```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── modules/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

## Responsibilities
`config`: environment/infrastructure.  
`routes`: HTTP routes.  
`controllers`: request/response only.  
`services`: application orchestration.  
`modules`: domain logic.  
`middlewares`: auth, authorization, validation, errors, rate limits, uploads.  
`validators`: external input schemas.  
`utils`: reusable technical helpers.  
`models`: Prisma/database-facing types.

## Database Models
Create Prisma models for:
```text
User
Workspace
Business
TaxReturn
Document
DocumentPage
ExtractedField
IncomeEntry
Deduction
Expense
Transaction
TaxCalculation
TaxCalculationLine
TaxRule
TaxSaving
ValidationIssue
ComplianceItem
CopilotConversation
CopilotMessage
Review
Approval
AuditLog
Notification
RefreshToken
```
Use UUIDs, timestamps, foreign keys, indexes and enums. Use JSON/JSONB only for flexible metadata/source/provider data.

## API Base
`/api/v1`

Health: `GET /health`, `GET /api/v1/health`

Success:
```json
{"data":{},"meta":{}}
```
Error:
```json
{"error":{"code":"VALIDATION_ERROR","message":"Invalid request","details":[]}}
```

## Authentication
```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```
JWT contains minimal claims only; never put tax data in tokens.

## Workspaces
```text
GET    /api/v1/workspaces
POST   /api/v1/workspaces
GET    /api/v1/workspaces/:workspaceId
PATCH  /api/v1/workspaces/:workspaceId
DELETE /api/v1/workspaces/:workspaceId
```
Every resource must verify workspace ownership.

## Business
```text
GET    /api/v1/businesses
POST   /api/v1/businesses
GET    /api/v1/businesses/:businessId
PATCH  /api/v1/businesses/:businessId
DELETE /api/v1/businesses/:businessId
```

## Documents
```text
POST   /api/v1/documents/upload
GET    /api/v1/documents
GET    /api/v1/documents/:documentId
DELETE /api/v1/documents/:documentId
GET    /api/v1/documents/:documentId/download
GET    /api/v1/documents/:documentId/extracted-fields
POST   /api/v1/documents/:documentId/verify
POST   /api/v1/documents/:documentId/reprocess
```
Support PDF, PNG, JPG, JPEG, XLSX and CSV as appropriate. Store binaries in object storage, metadata in PostgreSQL.

## Tax Returns
```text
GET   /api/v1/tax-returns
POST  /api/v1/tax-returns
GET   /api/v1/tax-returns/:returnId
PATCH /api/v1/tax-returns/:returnId
```

## Individual
```text
GET    /api/v1/tax-returns/:returnId/income
POST   /api/v1/tax-returns/:returnId/income
PATCH  /api/v1/income/:incomeId
DELETE /api/v1/income/:incomeId
GET    /api/v1/tax-returns/:returnId/deductions
POST   /api/v1/tax-returns/:returnId/deductions
PATCH  /api/v1/deductions/:deductionId
DELETE /api/v1/deductions/:deductionId
```

## SME
```text
GET  /api/v1/businesses/:businessId/financial-summary
GET  /api/v1/businesses/:businessId/revenue
POST /api/v1/businesses/:businessId/revenue
GET  /api/v1/businesses/:businessId/expenses
POST /api/v1/businesses/:businessId/expenses
PATCH /api/v1/expenses/:expenseId
DELETE /api/v1/expenses/:expenseId
GET  /api/v1/businesses/:businessId/transactions
POST /api/v1/businesses/:businessId/transactions
```

## Tax Engine
```text
POST /api/v1/tax-returns/:returnId/calculate
GET  /api/v1/tax-returns/:returnId/calculation
GET  /api/v1/tax-returns/:returnId/calculation/lines
POST /api/v1/tax-returns/:returnId/compare-regimes
```
Rules must be versioned. Store calculation inputs, rule codes/versions, lines and outputs.

## Validation
```text
POST  /api/v1/tax-returns/:returnId/validate
GET   /api/v1/tax-returns/:returnId/validation
GET   /api/v1/tax-returns/:returnId/issues
PATCH /api/v1/issues/:issueId
POST  /api/v1/issues/:issueId/resolve
```

## Tax Savings
```text
GET  /api/v1/tax-returns/:returnId/tax-savings
POST /api/v1/tax-returns/:returnId/tax-savings/recalculate
```

## Compliance
```text
GET   /api/v1/workspaces/:workspaceId/compliance
POST  /api/v1/workspaces/:workspaceId/compliance
PATCH /api/v1/compliance/:complianceId
```

## Copilot
```text
GET    /api/v1/copilot/conversations
POST   /api/v1/copilot/conversations
GET    /api/v1/copilot/conversations/:conversationId
POST   /api/v1/copilot/conversations/:conversationId/messages
DELETE /api/v1/copilot/conversations/:conversationId
```
Use provider abstractions for LLM and RAG. Return source references.

## Review / Approval
```text
GET  /api/v1/tax-returns/:returnId/review
POST /api/v1/tax-returns/:returnId/review
POST /api/v1/tax-returns/:returnId/approve
```
Block approval when validation is incomplete or critical issues remain.

## Dashboard APIs
Individual: `GET /api/v1/dashboard/individual`  
SME: `GET /api/v1/dashboard/sme`

Return the complete dashboard data required by the existing React screens so the frontend does not need a long chain of dependent requests.

## Environment
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/taxpilot
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
REDIS_URL=
OCR_PROVIDER=
OCR_API_KEY=
LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=
RAG_VECTOR_STORE=
```

## Frontend Integration Procedure
Before implementing APIs, inspect the React project completely:
1. pages/routes
2. API clients
3. TypeScript interfaces
4. mock data
5. forms
6. dashboard fields
7. document UI
8. tax/calculation UI
9. validation/issues UI
10. Copilot UI
11. review/approval UI

Map each frontend screen to an endpoint and response contract. Preserve the current UI and replace mocks progressively.

## Testing
Unit tests for auth, tax engine, validation, readiness, savings and source tracing. Integration/API tests for auth, workspace isolation, documents, CRUD, calculation, validation and approval. Verify 401/403/404 and malformed-input cases.

## Commands
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
npm test
npm run lint
```

Do not create fake production results. Provider mocks must be explicitly development-only.
