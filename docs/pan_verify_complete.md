You are working on my existing TaxPilot project.

TaxPilot is an AI-assisted automated tax filing system for Individuals and SMEs.

IMPORTANT:
Before changing anything, inspect the complete existing project structure, frontend, backend, database schema, authentication flow, API conventions, environment configuration, and existing PAN verification UI.

DO NOT redesign the application.
DO NOT modify unrelated functionality.
DO NOT replace existing architecture unnecessarily.
Reuse existing components, services, database patterns, API patterns, authentication middleware, validation utilities, and UI components wherever possible.

==================================================
OFFICIAL SETU DOCUMENTATION
==================================================

Use ONLY the official Setu PAN API documentation as the source of truth:

https://docs.setu.co/data/pan/quickstart

Do not invent undocumented Setu endpoints, headers, request fields, response fields, authentication mechanisms, or status values.

Setu currently documents:

Sandbox:
https://dg-sandbox.setu.co

Production:
https://dg.setu.co

Required headers:
x-client-id
x-client-secret
x-product-instance-id

PAN verification endpoint:

POST /api/verify/pan

Request:

{
  "pan": "ABCDE1234A",
  "consent": "Y",
  "reason": "Reason for verifying PAN set by the developer"
}

Setu requires consent to be Y/y.

The reason must contain at least 20 characters.

The documented successful response can contain:

{
  "data": {
    "aadhaar_seeding_status": "LINKED",
    "category": "Individual",
    "full_name": "John Doe",
    "first_name": "John Hartwell",
    "middle_name": "Walter",
    "last_name": "Doe"
  },
  "message": "PAN is valid",
  "verification": "success",
  "traceId": "..."
}

Important:
aadhaar_seeding_status is optional.

Do not assume this field will always exist.

==================================================
PHASE 1 — INSPECT EXISTING PROJECT
==================================================

First inspect:

1. Frontend directory
2. Backend directory
3. package.json files
4. TypeScript configuration
5. Existing API client
6. Existing Express routes
7. Existing controllers/services
8. Existing database architecture
9. Prisma/schema/database models if present
10. Existing Clerk authentication
11. Existing PAN verification UI
12. Existing environment files
13. Existing tests
14. Existing error handling
15. Existing API response conventions

Determine the actual project structure before creating files.

DO NOT blindly create duplicate files.

If equivalent files/modules already exist, extend them instead of creating duplicates.

At the end of inspection, state:

- frontend framework
- backend framework
- database ORM
- authentication system
- existing PAN UI location
- existing API client location
- existing database schema location
- existing backend route structure

Then implement.

==================================================
PHASE 2 — BACKEND MODULE
==================================================

Create a clean PAN verification module following the existing backend architecture.

Preferred structure if it matches the existing project:

backend/src/modules/pan/
    pan.controller.ts
    pan.service.ts
    pan.routes.ts
    pan.types.ts
    pan.validator.ts
    providers/
        pan.provider.ts
        setu-pan.provider.ts
        mock-pan.provider.ts

If the existing backend uses a different structure, follow the existing architecture instead.

Do NOT force this exact structure if it conflicts with the existing codebase.

==================================================
PHASE 3 — PROVIDER ABSTRACTION
==================================================

Create a provider interface.

Example:

interface PanProvider {
  verifyPan(input: {
    pan: string;
    consent: "Y";
    reason: string;
  }): Promise<PanVerificationResult>;
}

Create a normalized internal response type.

Example:

type PanVerificationResult = {
  verification: "success" | "failed";
  message?: string;
  traceId?: string;
  data?: {
    category?: string;
    fullName?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    aadhaarSeedingStatus?: string;
  };
};

Do not invent additional Setu response fields.

The provider abstraction must allow:

PAN_PROVIDER=setu

or

PAN_PROVIDER=mock

==================================================
PHASE 4 — SETU PROVIDER
==================================================

Create:

setu-pan.provider.ts

The provider must:

1. Read credentials from environment variables.
2. Never receive credentials from the frontend.
3. Never expose credentials in API responses.
4. Never log credentials.
5. Never log the full PAN.
6. Use the Setu sandbox URL initially.
7. Call:

POST https://dg-sandbox.setu.co/api/verify/pan

8. Send:

{
  "pan": "...",
  "consent": "Y",
  "reason": "..."
}

9. Send the required headers:

x-client-id
x-client-secret
x-product-instance-id

10. Use JSON content type.
11. Set a reasonable HTTP timeout.
12. Parse the documented Setu response.
13. Preserve traceId internally/for safe client response if appropriate.
14. Correctly distinguish:
    - PAN valid
    - PAN invalid
    - PAN not found
    - consent error
    - reason length error
    - authentication/credential error
    - timeout
    - Setu/server error
    - network error

Do not convert every error into HTTP 500.

Create a normalized internal error system according to the existing backend conventions.

==================================================
PHASE 5 — ENVIRONMENT VARIABLES
==================================================

Add/update the backend environment configuration.

Required:

PAN_PROVIDER=setu

SETU_BASE_URL=https://dg-sandbox.setu.co

SETU_CLIENT_ID=your_client_id

SETU_CLIENT_SECRET=your_client_secret

SETU_PRODUCT_INSTANCE_ID=your_product_instance_id

IMPORTANT:

These variables must exist ONLY in the backend.

Never create:

VITE_SETU_CLIENT_ID
VITE_SETU_CLIENT_SECRET
VITE_SETU_PRODUCT_INSTANCE_ID

Never expose Setu credentials to React/browser code.

Update .env.example with placeholders only.

Example:

PAN_PROVIDER=mock

SETU_BASE_URL=https://dg-sandbox.setu.co

SETU_CLIENT_ID=
SETU_CLIENT_SECRET=
SETU_PRODUCT_INSTANCE_ID=

Do not commit real credentials.

If the project has environment validation, integrate these variables into it.

==================================================
PHASE 6 — PAN VALIDATION
==================================================

Validate PAN before making the Setu API request.

Use:

^[A-Z]{5}[0-9]{4}[A-Z]$

Normalize input:

- trim whitespace
- convert to uppercase

Reject invalid PAN format before calling Setu.

Example:

ABCDE1234A → valid format

ABCDE1234 → invalid

abcde1234a → normalize to ABCDE1234A

ABCDE12345 → invalid

Do not treat format validation as government verification.

Clearly distinguish:

FORMAT_VALID

from

PAN_VERIFIED_BY_SETU

==================================================
PHASE 7 — USER CONSENT
==================================================

The frontend must explicitly collect user consent.

Backend must NOT trust only the UI.

Request to our TaxPilot backend:

POST /api/pan/verify

Example:

{
  "pan": "ABCDE1234A",
  "consent": true
}

The backend must verify:

consent === true

If consent is missing or false:

return an appropriate 400 response.

The backend should then convert this into:

consent: "Y"

when calling Setu.

The user should NOT control the Setu reason.

Use a server-defined reason such as:

"PAN verification for TaxPilot tax filing assistance"

Ensure the reason satisfies Setu's minimum length requirement.

==================================================
PHASE 8 — TAXPILOT BACKEND API
==================================================

Create:

POST /api/pan/verify

Flow:

Frontend
   ↓
POST /api/pan/verify
   ↓
Clerk authentication middleware
   ↓
PAN controller
   ↓
PAN validation
   ↓
Consent validation
   ↓
PAN service
   ↓
Selected PanProvider
   ↓
SetuPanProvider OR MockPanProvider
   ↓
Setu API
   ↓
Normalize response
   ↓
Store verification result
   ↓
Return safe response to frontend

The endpoint must use the existing Clerk authentication mechanism if TaxPilot already protects authenticated APIs.

Do not create a second authentication system.

Retrieve the authenticated user's Clerk identity using the project's existing authentication middleware.

Map the Clerk user to the existing application User record according to the current database architecture.

Do not create duplicate users.

==================================================
PHASE 9 — DATABASE
==================================================

Inspect the existing PostgreSQL/Prisma/database architecture first.

If TaxPilot already has an identity/tax-profile table, extend it rather than creating unnecessary duplicate tables.

If no appropriate table exists, create a dedicated model following the project's naming conventions.

Preferred conceptual fields:

TaxIdentity / PanVerification:

id
userId
pan
panStatus
category
fullName
firstName
middleName
lastName
aadhaarSeedingStatus
verified
verificationProvider
traceId
verifiedAt
createdAt
updatedAt

Use the project's existing ID conventions.

IMPORTANT SECURITY:

Do not log the full PAN.

If the existing security architecture supports encryption at rest, use it for stored PAN.

If not, do not invent an incompatible encryption system just for this feature. Follow the existing security/data-storage architecture and document the limitation.

The UI should display a masked PAN such as:

ABCDE****A

Do not expose the full PAN unnecessarily.

Do not store Aadhaar number.

Only store aadhaar_seeding_status if Setu returns it.

==================================================
PHASE 10 — DATABASE RELATIONSHIP
==================================================

The PAN verification must belong to the authenticated TaxPilot user.

Expected relationship:

Clerk User
    ↓
TaxPilot User
    ↓
PAN / Tax Identity
    ↓
Tax Filing Profile

Do not associate PAN data with a random client-provided userId.

The backend must derive the authenticated user from the existing Clerk session.

==================================================
PHASE 11 — MOCK PROVIDER
==================================================

Create:

mock-pan.provider.ts

This provider must allow frontend/backend development without Setu credentials.

Example behavior based on the documented sandbox test values:

ABCDE1234A
→ successful verification

ABCDE1234B
→ invalid PAN

Other values
→ PAN not found

Mock response should follow the same internal PanVerificationResult interface as SetuPanProvider.

IMPORTANT:

Do not make mock mode look like real government verification.

The UI/backend response should identify:

verificationProvider: "mock"

or equivalent.

Development environment may use:

PAN_PROVIDER=mock

Production/sandbox integration uses:

PAN_PROVIDER=setu

==================================================
PHASE 12 — CONTROLLER
==================================================

Create/update:

pan.controller.ts

Responsibilities:

1. Read authenticated user.
2. Validate request body.
3. Validate consent.
4. Normalize PAN.
5. Call PAN service.
6. Save verification result.
7. Return safe response.
8. Handle expected errors.
9. Never expose Setu secrets.
10. Never expose internal stack traces in production.

Do not put Setu HTTP logic directly inside the controller.

==================================================
PHASE 13 — SERVICE
==================================================

Create/update:

pan.service.ts

Responsibilities:

1. Select provider based on PAN_PROVIDER.
2. Validate business rules.
3. Call provider.
4. Normalize result.
5. Persist verification.
6. Return normalized result.

Example:

PanService
   ↓
PanProvider
   ├── SetuPanProvider
   └── MockPanProvider

Keep the controller thin.

==================================================
PHASE 14 — ROUTES
==================================================

Create/update:

pan.routes.ts

Register:

POST /api/pan/verify

Use the existing API prefix conventions.

For example, if the backend currently does:

app.use("/api", routes)

then use:

router.use("/pan", panRoutes)

so the final endpoint becomes:

POST /api/pan/verify

Do not create a duplicate Express app or router.

==================================================
PHASE 15 — FRONTEND INTEGRATION
==================================================

Now inspect the existing TaxPilot PAN verification UI.

DO NOT redesign it.

DO NOT replace the existing design.

Connect the existing UI to:

POST /api/pan/verify

The frontend flow must be:

User enters PAN
        ↓
User checks consent checkbox
        ↓
User clicks Verify PAN
        ↓
Frontend validates basic input
        ↓
Frontend calls backend
        ↓
Backend authenticates Clerk user
        ↓
Backend validates PAN + consent
        ↓
Backend calls Setu/mock provider
        ↓
Backend stores result
        ↓
Backend returns normalized result
        ↓
Frontend updates existing UI

Use the project's existing API client.

If the project already has:

axios instance

or

fetch wrapper

or

React Query/TanStack Query

reuse it.

Do not introduce another HTTP client unnecessarily.

==================================================
PHASE 16 — FRONTEND REQUEST
==================================================

The frontend should send ONLY:

{
  "pan": "ABCDE1234A",
  "consent": true
}

Do NOT send:

SETU_CLIENT_ID
SETU_CLIENT_SECRET
SETU_PRODUCT_INSTANCE_ID

Do NOT send the Setu reason from the frontend.

The backend owns those values.

==================================================
PHASE 17 — FRONTEND STATES
==================================================

The existing PAN UI must correctly handle these states:

1. Initial

2. Entering PAN

3. Consent not checked

4. Validating

5. Verifying

6. Verification successful

7. PAN invalid

8. PAN not found

9. Invalid PAN format

10. Setu authentication/configuration error

11. Timeout

12. Network error

13. Unexpected server error

14. Previously verified

Do not redesign the UI.

Use existing loading, alert, toast, card, badge, and error components if available.

==================================================
PHASE 18 — SUCCESS RESPONSE
==================================================

Normalize the backend response to something similar to:

{
  "success": true,
  "verification": "success",
  "message": "PAN is valid",
  "data": {
    "pan": "ABCDE****A",
    "category": "Individual",
    "fullName": "John Doe",
    "firstName": "John",
    "middleName": null,
    "lastName": "Doe",
    "aadhaarSeedingStatus": "LINKED"
  },
  "verificationProvider": "setu",
  "traceId": "..."
}

IMPORTANT:

Do not return the unprocessed Setu response blindly.

Create a stable TaxPilot API contract.

Do not expose unnecessary Setu/internal data.

If aadhaar_seeding_status is missing:

return:

"aadhaarSeedingStatus": null

Do not invent a value.

==================================================
PHASE 19 — AADHAAR-PAN STATUS
==================================================

Setu documents:

aadhaar_seeding_status

as an optional field in the PAN verification response.

If Setu returns:

"aadhaar_seeding_status": "LINKED"

then show:

Aadhaar-PAN Status: Linked

If another documented value is returned, display it without inventing or transforming it incorrectly.

If the field is missing:

Aadhaar-PAN Status: Not provided by verification response

Do NOT assume:

missing = unlinked

Do NOT call a separate Aadhaar API unless explicitly required.

Do NOT collect Aadhaar number for this PAN verification feature.

==================================================
PHASE 20 — ERROR MAPPING
==================================================

Implement safe error mapping.

Expected cases:

400:
- missing consent
- insufficient reason
- malformed request

404:
- PAN not found

Successful HTTP response with:

verification = failed

and:

message = "PAN is invalid"

must be treated as a verification failure, not necessarily a transport/server error.

Authentication/configuration errors:
- missing Setu credentials
- invalid Setu credentials

Network:
- timeout
- DNS/network failure

Setu server:
- 5xx

Return stable TaxPilot errors.

Example:

{
  "success": false,
  "error": {
    "code": "PAN_NOT_FOUND",
    "message": "PAN could not be found."
  }
}

Do not leak:

- Setu client secret
- raw authorization headers
- environment variables
- stack traces
- full PAN

==================================================
PHASE 21 — LOGGING
==================================================

Never log:

full PAN
SETU_CLIENT_ID
SETU_CLIENT_SECRET
SETU_PRODUCT_INSTANCE_ID
authorization headers
Clerk tokens
cookies

If logging PAN-related requests, use:

ABCDE****A

Trace IDs may be logged if they are safe.

Errors should contain enough information for debugging without exposing credentials or sensitive personal data.

==================================================
PHASE 22 — API CLIENT
==================================================

If the frontend already has something like:

src/services/api.ts

src/lib/api.ts

src/api/client.ts

reuse it.

If necessary, add:

panApi.ts

or an equivalent module following the existing structure.

Example:

verifyPan({
  pan,
  consent
})

The API client should call:

POST /api/pan/verify

Do not call Setu directly from React.

Architecture MUST remain:

React
 ↓
TaxPilot Backend
 ↓
Setu

NOT:

React
 ↓
Setu

==================================================
PHASE 23 — TYPES
==================================================

Create shared/frontend/backend types only if the existing architecture supports shared types.

Example frontend response type:

interface PanVerificationResponse {
  success: boolean;
  verification: "success" | "failed";
  message?: string;
  data?: {
    pan: string;
    category?: string;
    fullName?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    aadhaarSeedingStatus?: string | null;
  };
  verificationProvider?: "setu" | "mock";
  traceId?: string;
}

Follow the existing project's type conventions.

Do not duplicate types unnecessarily.

==================================================
PHASE 24 — TESTS
==================================================

Add backend tests following the existing test framework.

Minimum tests:

1. Valid PAN

Input:

{
  "pan": "ABCDE1234A",
  "consent": true
}

Expected:
successful verification.

2. Invalid PAN

Input:

{
  "pan": "ABCDE1234B",
  "consent": true
}

Expected:
verification failed.

3. Missing consent

Input:

{
  "pan": "ABCDE1234A",
  "consent": false
}

Expected:
400.

4. Missing consent field

Expected:
400.

5. Invalid PAN format

Example:

{
  "pan": "INVALID",
  "consent": true
}

Expected:
400.

6. Lowercase PAN

Example:

abcde1234a

Expected:
normalize to:

ABCDE1234A

before provider call.

7. Missing Setu credentials

When:

PAN_PROVIDER=setu

and required credentials are missing:

Expected:
configuration error.

8. Setu timeout

Mock timeout/network failure.

Expected:
appropriate error response.

9. Setu 404

Expected:
PAN_NOT_FOUND.

10. Setu invalid PAN response

Expected:
PAN_INVALID.

11. Successful response containing aadhaar_seeding_status

Expected:
status is stored and returned.

12. Successful response without aadhaar_seeding_status

Expected:
aadhaarSeedingStatus = null.

==================================================
PHASE 25 — DATABASE MIGRATION
==================================================

If Prisma is used:

1. Modify schema.prisma.
2. Create migration.
3. Generate Prisma client.
4. Verify migration.
5. Do not delete existing data.
6. Do not modify unrelated models.

Use the existing database naming conventions.

If another ORM is used, follow that ORM.

Do NOT switch ORM.

==================================================
PHASE 26 — FRONTEND AUTHENTICATION
==================================================

TaxPilot already uses Clerk.

Use the existing Clerk authentication/session flow.

The PAN verification request must be made only by an authenticated user if the existing TaxPilot architecture requires authenticated API access.

Do not create:

- custom JWT
- custom login
- custom password authentication
- custom session storage

Clerk remains the authentication source of truth.

The TaxPilot database remains the application-data source of truth.

==================================================
PHASE 27 — ENVIRONMENT SETUP
==================================================

Create/update:

backend/.env.example

and, only if appropriate for the existing repository:

frontend/.env.example

DO NOT place Setu secrets in frontend env.

Backend:

PAN_PROVIDER=mock

SETU_BASE_URL=https://dg-sandbox.setu.co

SETU_CLIENT_ID=
SETU_CLIENT_SECRET=
SETU_PRODUCT_INSTANCE_ID=

For development without credentials:

PAN_PROVIDER=mock

For Setu sandbox testing:

PAN_PROVIDER=setu

and provide actual credentials.

Do not commit actual credentials.

==================================================
PHASE 28 — SETU SANDBOX TESTING
==================================================

Use the official Setu sandbox test values.

Valid:

ABCDE1234A

Invalid:

ABCDE1234B

The Setu documentation states that other PAN values can produce a PAN-not-found response in sandbox.

Do not use real PAN information for automated tests.

Do not put real user PAN data into source code.

==================================================
PHASE 29 — SECURITY REVIEW
==================================================

Before completing implementation, inspect for:

- exposed Setu secrets
- full PAN logs
- frontend Setu API calls
- hardcoded credentials
- hardcoded real PAN
- unsafe error responses
- unauthenticated PAN endpoint
- duplicate user creation
- missing consent validation
- missing server-side PAN validation

Fix all issues found.

==================================================
PHASE 30 — BUILD AND TEST
==================================================

After implementation run:

1. Backend tests
2. Frontend tests if present
3. TypeScript typecheck
4. Backend build
5. Frontend build
6. Lint if configured
7. Prisma validation/generation/migration if applicable

Do not stop after writing code.

Actually execute the available commands.

If a command fails:

- identify the cause
- fix it if related to this implementation
- rerun it
- do not hide failures

==================================================
PHASE 31 — FINAL REPORT
==================================================

At the end provide a detailed implementation report.

Include:

### 1. Files created

List every newly created file.

Example:

backend/src/modules/pan/pan.controller.ts
backend/src/modules/pan/pan.service.ts
...

### 2. Files modified

List every modified file.

### 3. Database changes

Explain:

- model/table added or modified
- migration name
- fields added
- relationships

### 4. Backend API

Show:

POST /api/pan/verify

and the request/response contract.

### 5. Frontend integration

Explain:

- which existing component was connected
- which API client was used
- how loading/error/success states work

### 6. Environment variables

List variable NAMES only.

Never print actual secret values.

### 7. Provider

State:

PAN_PROVIDER=mock

or

PAN_PROVIDER=setu

depending on the configured environment.

### 8. Tests

List every test added and its result.

### 9. Build

Report:

TypeScript: PASS/FAIL
Backend build: PASS/FAIL
Frontend build: PASS/FAIL
Lint: PASS/FAIL

### 10. Remaining manual setup

Clearly identify anything that YOU cannot do automatically, such as:

- creating Setu account
- obtaining Setu credentials
- configuring Setu product instance
- adding credentials to local .env
- production onboarding

Do not claim Setu production access if credentials are not available.

==================================================
FINAL IMPORTANT RULES
==================================================

1. Do not redesign the existing TaxPilot UI.
2. Do not modify unrelated modules.
3. Do not create duplicate authentication.
4. Do not call Setu directly from frontend.
5. Never expose Setu secrets.
6. Never log full PAN.
7. Always validate PAN server-side.
8. Always validate consent server-side.
9. Keep Setu integration behind PanProvider.
10. Keep MockProvider available.
11. Use PostgreSQL through the existing database architecture.
12. Use Clerk as the existing authentication system.
13. Do not invent Setu API behavior.
14. Do not invent Aadhaar-link status values.
15. Treat aadhaar_seeding_status as optional.
16. Do not treat PAN format validation as actual PAN verification.
17. Do not claim that the PAN has been verified unless the provider actually returns successful verification.
18. Do not claim that Aadhaar-PAN is linked if Setu did not return that status.
19. Run the actual tests and builds before declaring completion.
20. Report every changed file.

Start by inspecting the existing repository. Do not start coding until you understand the existing architecture.