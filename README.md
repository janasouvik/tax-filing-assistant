# TaxPilot — Intelligent Automated Tax Filing Assistant

**TaxPilot** is an intelligent, deterministic, and source-traceable automated tax filing assistant built for Indian individual taxpayers and SMEs. It transforms tax documents, financial data, and complex statutory provisions of the Indian Income-tax Act into a clear, reviewable, and compliant 12-step filing workflow.

---

## 🌟 Key Features

### 1. 12-Step Guided Filing Workflow
TaxPilot guides individual taxpayers step-by-step through a complete statutory filing lifecycle:
1. **Personal Profile**: Official taxpayer information with state and residential status selection.
2. **PAN Verification**: Real-time PAN format verification and status validation (with Sandbox & Setu integration).
3. **Aadhaar–PAN Status**: Section 139AA compliance checker verifying linkage status with ITD portal guidance.
4. **ITR Eligibility**: Dynamic, rule-based recommendation of the applicable ITR form (ITR-1 Sahaj, ITR-2, ITR-3, ITR-4 Sugam) with the ability to switch between forms.
5. **Document Collection**: Secure document vault for Form 16, Form 26AS/AIS, bank statements, and investment proofs.
6. **Income Schedules**: Multi-source income entries (Salary/Pension, House Property, Capital Gains, Business, Other Sources) with automatic TDS tracking.
7. **Deductions Optimizer**: Chapter VI-A deductions (80C, 80CCD(1B), 80D, 80E, 80G, 80TTA, 24(b), and Standard Deduction).
8. **Deterministic Tax Engine**: Real-time Old vs. New Regime calculation and comparative savings optimizer.
9. **Validation Engine**: Pre-submission diagnostic engine checking for missing mandatory fields, PAN/Aadhaar mismatches, and compliance errors.
10. **Final Review & User Approval**: Review of complete return summary with immutable, cryptographic SHA-256 snapshot hashing.
11. **Government ITR Filing Gateway**: Secure submission state machine with duplicate-submission prevention and acknowledgement persistence.
12. **e-Verification**: Multi-channel verification support (Aadhaar OTP, Net Banking EVC, Bank Account EVC, Demat, and physical ITR-V).

### 2. Deterministic Tax Engine
- **Strict Separation of Tax Frameworks**:
  - **Assessment Year 2026–27 (`AY2026-27-v1`)**: Under the Income-tax Act, 1961 (incorporating Finance Act, 2024 revised slabs: ₹0–3L @ 0%, ₹3–7L @ 5%, ₹7–10L @ 10%, ₹10–12L @ 15%, ₹12–15L @ 20%, above ₹15L @ 30%, ₹75,000 standard deduction, and Section 87A rebate up to ₹7,00,000 with marginal relief).
  - **Tax Year 2026–27 (`TY2026-27-v1`)**: Distinct future tax-year framework under the Income-tax Act, 2025.
  - **Assessment Years 2024–25 & 2025–26**: Full retrospective slab and deduction rule configurations.
- **Old vs. New Regime Comparison**: Automatically identifies the optimal regime and calculates exact net tax savings or refund payable.
- **Source-Traceable Auditing**: Zero black-box LLM math. All tax liability computations run through certified deterministic calculators.

### 3. Business & SME Compliance OS
- **SME Tax Dashboard**: Real-time revenue, expense, and taxable profit tracking across quarterly installments.
- **Section 43B(h) Radar**: 45-day MSME supplier payment aging to protect operating expense deductions.
- **Statutory Deadlines & Telemetry**: Dynamic tax calendar tracking Section 208/211 advance tax installments (Tranches 1–4) and Section 234A/B/C interest simulations.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Tooling**: Vite 8, Tailwind CSS, Lucide Icons, Material Symbols
- **Routing**: React Router v7 (with full route aliases and catch-all redirects)
- **Authentication**: Clerk React SDK

### Backend
- **Runtime**: Node.js & Express 5 with TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM 5
- **Security & Validation**: Zod schema validators, Argon2 hashing, Helmet, Rate Limiting
- **Logging**: Pino & Pino-HTTP structured telemetry
- **Concurrency & Integrity**: Isolated database transactions (`$transaction`) and SHA-256 canonical financial snapshot hashing

### Testing
- **Unit Testing**: Vitest (178 unit tests passing)
- **Integration Testing**: Vitest with isolated PostgreSQL test database (37 integration tests passing)
- **End-to-End Testing**: Playwright test suite

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (v15+ running locally or hosted)
- [Clerk Account](https://clerk.com/) for development authentication keys

---

### 1. Clone the Repository
```bash
git clone https://github.com/janasouvik/tax-filing-assistant.git
cd tax-filing-assistant
```

---

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
```

Ensure your `backend/.env` contains your PostgreSQL connection and Clerk credentials:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/taxpilot_db
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:5173
```

Push database schema and seed official tax rules:
```bash
npx prisma db push
npm run db:seed
```

Start the backend development server:
```bash
npm run dev
# Server runs on http://localhost:5001
```

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Configure frontend environment variables
cp .env.example .env
```

Ensure `frontend/.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Start the frontend development server:
```bash
npm run dev
# Vite dev server runs on http://localhost:5173
```

---

## 🧪 Testing & Verification

### Run Backend Unit Tests (178 tests)
```bash
cd backend
npm run test:unit
```

### Run PostgreSQL Integration Tests (37 tests)
```bash
cd backend
# Uses isolated test database taxpilot_test_db
npm run test:integration
```

### Run Production Builds
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

---

## 📁 Repository Structure

```
tax-filing-assistant/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema & enums
│   │   └── seed.ts                # Tax rules & tax slabs seeder
│   ├── src/
│   │   ├── config/                # Database & environment configuration
│   │   ├── controllers/           # API handlers (individual, taxReturn, workspace)
│   │   ├── middlewares/           # Auth (Clerk), validation, upload
│   │   ├── modules/
│   │   │   ├── pan/               # PAN validation & Setu provider adapters
│   │   │   ├── review/            # Cryptographic approval & hashing
│   │   │   ├── taxEngine/         # Slabs, rebates, deductions & AY resolvers
│   │   │   └── validation/        # Return issue & compliance validator
│   │   ├── routes/                # Express API routes
│   │   ├── services/              # Business logic (filing, verification, returns)
│   │   └── server.ts              # Express application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Navbar, SharedComponents)
│   │   ├── pages/
│   │   │   ├── individual/        # 12-Step individual tax filing workflow
│   │   │   ├── SMETaxDashboard    # SME financial & compliance cockpit
│   │   │   ├── Onboarding         # Profile selector & workspace setup
│   │   │   └── Home.tsx           # Landing page & features
│   │   ├── services/              # Frontend API client
│   │   ├── App.tsx                # Route definitions & aliases
│   │   └── main.tsx               # Application bootstrap
│   └── package.json
└── README.md
```

---

## 🔒 Security & Compliance
- **Zero Mock Data in Production**: All filing transmissions require verified ERI and UIDAI gateway credentials.
- **Deterministic Immutability**: Return approvals are locked with canonical SHA-256 financial snapshot hashes.
- **Race Condition Prevention**: Database transactions and concurrency protections safeguard financial modifications after approval.

---

## 📄 License
ISC License. Built for Indian Income Tax compliance.
