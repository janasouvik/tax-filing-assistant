You are working on my TaxPilot project.

TaxPilot is an AI-powered tax filing assistant for Indian Individual taxpayers and SMEs.

IMPORTANT:
Do NOT blindly rewrite or redesign the existing application.

First inspect the entire existing project and understand:
- frontend framework
- frontend folder structure
- existing pages
- existing components
- existing routing
- existing authentication
- backend framework
- database
- API structure
- existing design system
- existing dashboard
- existing Individual section
- existing tax-related modules

Then implement the Individual taxpayer onboarding and identity/taxpayer verification flow described below.

==================================================
1. CORE PRODUCT IDEA
==================================================

TaxPilot does NOT replace the Government Income Tax e-Filing portal.

The Government portal remains responsible for official tax filing.

TaxPilot is an intelligent layer that helps users:

- understand what they need to do
- verify taxpayer information
- collect tax documents
- extract information from documents
- organize income and deductions
- compare tax regimes
- calculate tax
- detect errors
- provide tax-saving insights
- prepare the return
- let the user review and approve
- then proceed toward official filing/e-verification

Product principle:

RULE ENGINE CALCULATES
AI EXPLAINS
VALIDATION CHECKS
USER REVIEWS
USER APPROVES
GOVERNMENT PORTAL/AUTHORIZED INTEGRATION FILES

Never allow an LLM to independently determine final tax calculations.

==================================================
2. IMPORTANT AUTHENTICATION SEPARATION
==================================================

There are THREE separate concepts:

A. TaxPilot Account Authentication
B. PAN Verification
C. Aadhaar-PAN Link Status / Official e-Verification

A. TaxPilot authentication:
Use the existing Clerk authentication setup if Clerk is already integrated.

Clerk answers:

"Who is this TaxPilot user?"

B. PAN verification:
PAN verification answers:

"Is this PAN valid/active and do the supplied taxpayer details match?"

C. Aadhaar-PAN status:
This answers:

"Is this taxpayer's PAN linked with Aadhaar / what is the current linkage status?"

Do NOT combine these concepts.

Do NOT build custom username/password/JWT authentication if Clerk already handles authentication.

==================================================
3. FIRST STEP — INSPECT BEFORE MODIFYING
==================================================

Before changing anything:

1. Inspect package.json.
2. Identify frontend framework.
3. Identify whether frontend is React/Vite/TypeScript/Next/etc.
4. Inspect src/.
5. Inspect routing.
6. Inspect existing Navbar/Header.
7. Inspect Login/Register/Get Started flow.
8. Inspect Clerk integration if present.
9. Inspect Individual dashboard.
10. Inspect existing tax modules.
11. Inspect backend.
12. Inspect database schema.
13. Inspect existing API client/service.
14. Inspect existing design tokens.
15. Inspect existing CSS/Tailwind/theme.
16. Identify reusable components.

Create an internal implementation plan based on the existing code.

Do NOT replace the existing architecture unless absolutely necessary.

==================================================
4. EXISTING UI MUST BE PRESERVED
==================================================

If an Individual section already exists:

EXTEND IT.

Do not replace it with a completely new application.

Preserve:
- existing navbar
- existing sidebar
- existing dashboard
- existing typography
- existing layout conventions
- existing components
- existing responsive behavior
- existing routes

Only add or improve the necessary screens/components.

If a required Individual screen does NOT exist:

CREATE IT using the existing project's UI system.

If there is no established design system, use the TaxPilot design system described below.

==================================================
5. TAXPILOT VISUAL DESIGN
==================================================

The UI should look like a professional fintech/tax platform.

Primary visual identity:

Deep Navy:
#061F4A
#0A0E17

Government/NASA-style blue accent:
#0B3D91

Cyan:
#02BFE7

Success Green:
#2E8540

Mint / soft green:
#E8F7EF

Warning Amber:
#FF9D1E

Error Red:
#DD361C

White:
#FFFFFF

Light background:
#F6F8FB

Typography:
- Inter for headings
- Public Sans for interface/body
- DM Mono only for technical identifiers, tax numbers, reference IDs, etc.

Design characteristics:
- clean
- professional
- trustworthy
- minimal
- modern fintech
- high information clarity
- generous spacing
- rounded cards
- subtle borders
- subtle shadows
- clear status indicators
- accessible contrast

DO NOT make it look like a generic AI chatbot.

It should look like a serious tax/financial application.

==================================================
6. INDIVIDUAL USER JOURNEY
==================================================

The complete Individual flow should be:

Login/Register
      ↓
Individual Dashboard
      ↓
Personal Profile
      ↓
PAN Verification
      ↓
Aadhaar-PAN Link Status
      ↓
Tax Profile
      ↓
ITR Eligibility
      ↓
Document Collection
      ↓
AI/OCR Extraction
      ↓
User Verification
      ↓
Income
      ↓
Deductions
      ↓
Tax Regime Comparison
      ↓
Tax Calculation
      ↓
Validation
      ↓
Tax Savings Insights
      ↓
Return Summary
      ↓
Final Review
      ↓
User Approval
      ↓
Submission Ready
      ↓
Official Filing / Authorized Filing Integration
      ↓
e-Verification
      ↓
Filing Complete

Implement this as a guided workflow rather than dumping every form on one page.

==================================================
7. INDIVIDUAL DASHBOARD
==================================================

Create/improve the Individual Dashboard.

The dashboard should show:

Header:
"Individual Tax Filing"

Assessment Year:
"AY 2026–27"

Progress:
"Your return is 20% complete"

Primary CTA:
"Continue Filing"

Secondary actions:
- Upload Documents
- Verify PAN
- Check Aadhaar-PAN Status
- View Tax Summary

Cards:

1. Taxpayer Verification
   PAN ✓
   Aadhaar-PAN ✓/Pending/Action Required

2. Documents
   X/Y documents processed

3. Income
   Extracted income

4. Deductions
   Total eligible deductions

5. Tax Estimate
   Estimated tax

6. Refund / Payable
   Current estimate

7. Filing Status
   Draft / Processing / Review / Approved / Filed / Verified

Use clear status badges:
- Verified
- Pending
- Action Required
- Failed
- Processing

==================================================
8. STEP 1 — PERSONAL PROFILE
==================================================

Create a Personal Profile screen if it does not exist.

Fields:

- Full Name
- Date of Birth
- Mobile Number
- Email
- Residential Status
- State
- City
- PIN Code

Do not unnecessarily duplicate information already available from Clerk.

Clearly distinguish:
TaxPilot account information
vs
Taxpayer information.

Allow:
Save & Continue

==================================================
9. STEP 2 — PAN VERIFICATION
==================================================

Create a dedicated PAN Verification screen.

UI:

----------------------------------
Verify your PAN
----------------------------------

"Let's verify your PAN before preparing your return."

PAN:
[ ABCDE1234F ]

Full Name:
[ John Doe ]

Date of Birth:
[ DD/MM/YYYY ]

Mobile Number:
[ +91 XXXXX XXXXX ]

[ Verify PAN ]

----------------------------------

After verification:

✓ PAN Verified

PAN:
ABCDE1234F

Name:
JOHN DOE

Date of Birth:
15/06/1998

PAN Status:
ACTIVE

Verification:
Name matched
DOB matched

[ Continue ]

==================================================
10. PAN VERIFICATION LOGIC
==================================================

Do NOT fake PAN verification.

If a legitimate PAN verification API/service is already configured:
use it.

If an authorized government/provider API is available:
create a proper backend service adapter.

Architecture:

Frontend
   ↓
POST /api/individual/pan/verify
   ↓
Backend
   ↓
PAN Verification Service
   ↓
Provider / authorized API
   ↓
Normalized response
   ↓
Frontend

Never put provider secret keys in frontend code.

Never expose secret credentials through VITE_ variables.

Frontend may only contain public configuration.

Backend must handle secrets.

==================================================
11. PAN VERIFICATION RESPONSE
==================================================

Normalize the provider response into something similar to:

{
  "verified": true,
  "pan": "ABCDE1234F",
  "name": "JOHN DOE",
  "dob": "1998-06-15",
  "status": "ACTIVE",
  "nameMatch": true,
  "dobMatch": true,
  "verifiedAt": "...",
  "providerReference": "..."
}

Do not store unnecessary sensitive information.

Mask PAN wherever possible in UI.

Example:

ABCDE****F

Only show full PAN when necessary and authorized.

==================================================
12. PAN VERIFICATION ERROR STATES
==================================================

Handle all states.

A. Invalid PAN

"PAN could not be verified."

B. PAN inactive

"Your PAN appears to be inactive."

C. Name mismatch

"Name does not match PAN records."

D. DOB mismatch

"Date of birth does not match PAN records."

E. Provider/API unavailable

"PAN verification is temporarily unavailable. Please try again."

F. Rate limit

"Too many verification attempts. Please try again later."

G. Network failure

"Unable to reach verification service."

NEVER show a fake green check if verification did not actually happen.

==================================================
13. IF PAN API IS NOT AVAILABLE
==================================================

If no authorized PAN verification API credentials exist:

DO NOT fake a real government verification.

Instead create:

1. PAN verification service interface
2. Provider adapter structure
3. Environment variable configuration
4. Clear development/sandbox mode
5. UI that clearly says:

"Verification service not configured"

For development only, a mock adapter may be used.

The mock response MUST visibly indicate:

"DEMO / SANDBOX"

Never present mock verification as real government verification.

==================================================
14. STEP 3 — AADHAAR-PAN LINK STATUS
==================================================

After successful PAN verification, create the:

"Aadhaar & PAN Status"

screen.

The purpose of this screen is NOT to replace official Aadhaar authentication.

It should show the current PAN-Aadhaar linkage status.

UI:

----------------------------------
Aadhaar & PAN
----------------------------------

PAN
✓ Verified

Aadhaar-PAN Link
✓ Linked

Your PAN and Aadhaar are linked.

[ Continue ]

OR:

⚠ Action Required

Your PAN-Aadhaar link could not be confirmed.

[ Check Status ]

OR:

⏳ Verification Pending

Your Aadhaar-PAN linking request is currently pending.

[ Check Again Later ]

==================================================
15. AADHAAR-PAN STATUS STATES
==================================================

Support at least:

LINKED
NOT_LINKED
PENDING
FAILED
PAN_INOPERATIVE
EXEMPT
UNKNOWN
SERVICE_UNAVAILABLE

Map these to friendly UI.

Example:

LINKED:
✓ Aadhaar linked with PAN

NOT_LINKED:
⚠ Aadhaar-PAN linkage required

PENDING:
⏳ Link request is under validation

FAILED:
✕ Aadhaar-PAN linkage validation failed

PAN_INOPERATIVE:
⚠ PAN appears to be inoperative

EXEMPT:
✓ Aadhaar-PAN linkage requirement does not apply based on available taxpayer information

UNKNOWN:
Unable to determine current status

==================================================
16. AADHAAR PRIVACY
==================================================

IMPORTANT:

Do NOT unnecessarily store raw Aadhaar numbers.

If Aadhaar number must be collected for an authorized integration:

- mask it
- encrypt sensitive data where appropriate
- never log it
- never print it in console
- never expose it in frontend source
- never expose it in URLs
- never store it unnecessarily

Example UI:

Aadhaar
XXXX XXXX 1234

Do NOT display:

1234 5678 9012

in normal dashboard UI.

==================================================
17. AADHAAR-PAN LINK CHECK ARCHITECTURE
==================================================

If an authorized provider/API is available:

Frontend
   ↓
POST /api/individual/aadhaar-pan/status
   ↓
Backend
   ↓
Authorized verification service
   ↓
Normalized status
   ↓
Frontend

Never call sensitive provider APIs directly from browser code.

Never expose provider credentials.

==================================================
18. LINKING FLOW
==================================================

If the user is NOT linked:

Show:

"Aadhaar-PAN Link Required"

Explain:

"Your PAN-Aadhaar linkage could not be confirmed."

Primary CTA:

"Resolve on Income Tax Portal"

This should take the user to the official Income Tax Department flow if appropriate.

Do NOT pretend TaxPilot itself completed government linkage unless there is a legitimate authorized integration.

If the official process requires the user to complete payment/OTP/linking on the government portal, clearly tell the user.

After the user completes it:

[ Check Status Again ]

==================================================
19. OFFICIAL STATUS BEHAVIOR
==================================================

The Income Tax Department provides an official Link Aadhaar/View Status flow.

The status can be:
- successful
- in progress/pending
- failed

The system also indicates that users may need to resolve cases where Aadhaar is associated with another PAN or PAN is associated with another Aadhaar.

Implement corresponding TaxPilot UI states.

Do NOT invent government response messages.

Use official documentation as the source of truth.

Official reference:
https://www.incometax.gov.in/

==================================================
20. IMPORTANT — DO NOT CONFUSE AADHAAR LINKING WITH E-VERIFICATION
==================================================

Aadhaar-PAN linkage is NOT the same thing as ITR e-verification.

Later in the filing journey, after the return is actually filed, the user may need to e-verify.

The architecture should support:

Filing
 ↓
Verification Pending
 ↓
e-Verification
 ↓
Verified

Possible official verification methods should be represented only according to the currently supported official process.

Do not build a fake Aadhaar OTP system.

==================================================
21. TAXPAYER VERIFICATION CARD
==================================================

Create a reusable component:

<TaxpayerVerificationCard />

It should display:

Taxpayer Verification

PAN
✓ Verified

Aadhaar-PAN
✓ Linked

Identity
✓ Ready

or:

PAN
✓ Verified

Aadhaar-PAN
⚠ Action Required

Identity
⚠ Needs Attention

This component should appear in:

- Individual Dashboard
- Tax Profile
- Filing Readiness
- Final Review

==================================================
22. PROGRESS STEPPER
==================================================

Create a reusable Individual filing stepper.

Example:

1 Profile
2 PAN
3 Aadhaar
4 Eligibility
5 Documents
6 Income
7 Deductions
8 Tax
9 Validation
10 Review
11 File
12 Verify

Current step should be visually highlighted.

Completed steps:
✓

Current:
●

Pending:
○

Error:
!

Allow users to navigate backwards safely.

Do not allow users to skip mandatory verification/validation steps.

==================================================
23. ITR ELIGIBILITY
==================================================

After taxpayer verification:

Determine potential ITR eligibility.

For MVP:

Support:

AY 2026–27
Individual
ITR-1

Do NOT automatically force ITR-1 if the taxpayer is not eligible.

Create an eligibility engine structure that can later support:

ITR-1
ITR-2
ITR-3
ITR-4

Example:

"Based on your current information, you appear eligible for ITR-1."

or:

"Your income profile may require a different ITR form."

Show:

Why?

- salary income
- house property
- other sources
- capital gains
- business/professional income
- foreign assets/income
- etc.

The final eligibility rules must come from official current ITR documentation.

==================================================
24. DOCUMENT COLLECTION
==================================================

Create a document upload page.

Suggested documents:

- Form 16
- Salary slips
- Bank interest certificate
- Bank statement
- Home loan certificate
- Investment proofs
- Donation receipts
- Previous ITR
- Other relevant documents

UI:

Upload documents

[ Drag & Drop ]

or

[ Browse Files ]

Each file:

Form16.pdf
Processing...

Then:

✓ Extracted
⚠ Needs Review
✕ Failed

==================================================
25. AI DOCUMENT EXTRACTION
==================================================

Architecture:

Document
 ↓
Upload
 ↓
Secure storage
 ↓
OCR
 ↓
Document classification
 ↓
AI extraction
 ↓
Normalization
 ↓
Validation
 ↓
User confirmation

Example:

Form 16

Extracted:

Employer:
ABC Technologies

Gross Salary:
₹8,50,000

TDS:
₹65,000

Assessment Year:
2026–27

Show:

[ Confirm ]
[ Edit ]

The user must always be able to correct extracted information.

==================================================
26. INCOME SECTION
==================================================

Create:

Income Details

Sections:

Salary/Pension
House Property
Other Sources
Eligible Capital Gains
Agricultural Income where applicable

Display:

Source
Amount
Document
Verification status

Example:

Salary
₹8,50,000
Source: Form 16
✓ Verified

==================================================
27. DEDUCTIONS
==================================================

Create:

Deductions

Potential categories:

80C
80D
80CCD
80G
Home Loan Interest
Other applicable deductions

Do NOT automatically claim something simply because AI detected it.

For every deduction:

Amount
Source document
Eligibility
Confidence
User confirmation

Example:

80D

Potential deduction:
₹25,000

Source:
Health Insurance Receipt

Status:
Needs user confirmation

[ Claim ]
[ Don't Claim ]

The rule engine must determine actual eligibility.

==================================================
28. OLD VS NEW TAX REGIME
==================================================

Create a visual comparison.

Example:

                New Regime       Old Regime

Taxable Income   ₹X              ₹Y
Deductions       ₹X              ₹Y
Tax              ₹X              ₹Y
Cess             ₹X              ₹Y
Final Liability  ₹X              ₹Y

Recommended:

New Tax Regime

Potential difference:

₹XX,XXX

Explain WHY.

Never allow an LLM to calculate the tax.

The tax calculation engine must calculate both scenarios deterministically.

==================================================
29. TAX CALCULATION ENGINE
==================================================

Separate tax calculation from UI.

Architecture:

Taxpayer Data
      ↓
Normalized Tax Data
      ↓
Tax Rule Engine
      ↓
Calculation Result

Calculation should be versioned:

assessmentYear
taxRegime
itrType
ruleVersion

Example:

calculateTax({
  assessmentYear,
  itrType,
  regime,
  income,
  deductions,
  tds,
  otherTaxData
})

Return:

{
  grossIncome,
  exemptions,
  deductions,
  taxableIncome,
  taxBeforeRebate,
  rebate,
  cess,
  totalTax,
  tds,
  advanceTax,
  taxPayable,
  refund
}

==================================================
30. VALIDATION ENGINE
==================================================

Create a validation layer.

Check:

- PAN verified
- taxpayer details complete
- Aadhaar-PAN status known where applicable
- ITR eligibility
- missing documents
- income inconsistencies
- TDS inconsistencies
- deduction eligibility
- calculation consistency
- mandatory fields
- invalid combinations

Display:

✓ No critical errors

or:

3 issues require attention

1. TDS mismatch
2. Missing bank details
3. Deduction requires confirmation

==================================================
31. TAX SAVINGS INSIGHTS
==================================================

Create:

"Tax Savings & Insights"

Examples:

"You may be eligible to claim an additional deduction."

"Your old-regime tax is higher than your new-regime tax based on the current information."

"Your Form 16 TDS differs from the amount entered."

AI can explain these results.

AI must NOT invent deductions.

AI must NOT invent tax rules.

AI must NOT make unsupported legal claims.

==================================================
32. FINAL REVIEW
==================================================

Create a final review screen.

Sections:

Taxpayer
PAN
Aadhaar-PAN status

Income
Total income

Deductions
Total deductions

Tax regime
Selected regime

Tax
Final tax

TDS
Total TDS

Refund/Payable

Documents
All required documents

Validation
✓ No critical issues

Button:

[ Approve Return ]

Before approval:

Show confirmation:

"Please review your return carefully. You are approving the information that will be used to prepare your tax return."

==================================================
33. APPROVAL STATE
==================================================

Only after user approval:

DRAFT
→ READY_FOR_SUBMISSION

Never automatically mark a return as filed.

==================================================
34. GOVERNMENT FILING
==================================================

IMPORTANT:

Do NOT fake government filing.

If there is no authorized Income Tax Department filing integration:

Show:

"Your return is ready for filing."

"TaxPilot has prepared and validated your return."

Then:

[ Continue to Official Filing ]

or another legitimate workflow based on the actual integration available.

Only set:

FILED

when an actual filing integration confirms successful filing.

==================================================
35. E-VERIFICATION
==================================================

After actual filing:

FILED
 ↓
VERIFICATION_PENDING
 ↓
USER_VERIFICATION
 ↓
VERIFIED

Create UI for verification status.

Do not implement fake Aadhaar OTP.

Do not claim successful verification without an actual verification result.

==================================================
36. DATABASE DESIGN
==================================================

Inspect the existing database first.

Do not create duplicate models.

If required, introduce appropriate structures similar to:

User
TaxpayerProfile
TaxReturn
TaxpayerIdentity
PANVerification
AadhaarPanStatus
TaxDocument
ExtractedField
Income
Deduction
TaxCalculation
TaxValidation
TaxInsight
FilingStatus

Example conceptual model:

TaxpayerProfile
- id
- userId
- assessmentYear
- panMasked
- residentialStatus
- filingStatus
- createdAt
- updatedAt

PANVerification
- id
- taxpayerId
- status
- verifiedName
- verifiedDob
- panStatus
- providerReference
- verifiedAt

AadhaarPanStatus
- id
- taxpayerId
- status
- checkedAt
- providerReference
- errorCode

Do not store raw Aadhaar unnecessarily.

Do not store sensitive provider secrets in database.

==================================================
37. API DESIGN
==================================================

Use the project's existing API conventions.

Potential endpoints:

GET
/api/individual/profile

PUT
/api/individual/profile

POST
/api/individual/pan/verify

GET
/api/individual/pan/status

POST
/api/individual/aadhaar-pan/status

GET
/api/individual/verification-status

POST
/api/individual/documents

GET
/api/individual/documents

POST
/api/individual/eligibility/check

GET
/api/individual/tax-summary

POST
/api/individual/tax/calculate

POST
/api/individual/validate

POST
/api/individual/return/approve

GET
/api/individual/return/status

Only create endpoints that don't already exist.

Reuse existing API structure where possible.

==================================================
38. SECURITY
==================================================

Mandatory:

- Clerk authentication
- Backend authorization
- User can access only their own taxpayer records
- Never trust userId from request body
- Derive authenticated user identity from Clerk/backend auth
- Validate all request bodies
- Rate-limit verification endpoints
- Never log PAN/Aadhaar unnecessarily
- Mask sensitive identifiers
- Never expose secret API keys to frontend
- Validate uploaded files
- Restrict file size/type
- Secure document storage
- Prevent IDOR
- Prevent users accessing another taxpayer's documents

==================================================
39. FRONTEND ROUTING
==================================================

Use existing routing.

If routes don't exist, create clean routes such as:

/individual

/individual/profile

/individual/verification

/individual/pan

/individual/aadhaar

/individual/eligibility

/individual/documents

/individual/income

/individual/deductions

/individual/tax

/individual/validation

/individual/review

/individual/filing

Do not duplicate routes already present.

Protect all Individual routes behind authentication.

==================================================
40. RESPONSIVE UI
==================================================

Desktop:
- sidebar
- top navigation
- large cards
- progress stepper

Tablet:
- responsive cards
- collapsible navigation

Mobile:
- stacked cards
- bottom/compact navigation
- full-width CTA
- readable forms
- no horizontal scrolling

==================================================
41. LOADING STATES
==================================================

Every async action needs proper UI.

PAN verification:

[Verifying PAN...]

Aadhaar-PAN status:

[Checking status...]

Document processing:

[Processing document...]

Tax calculation:

[Calculating...]

Validation:

[Checking return...]

Never leave the user staring at a blank screen.

==================================================
42. ERROR HANDLING
==================================================

Every API must have:

loading
success
empty
error
retry

Do not use browser alerts for normal application errors.

Use proper:
- toast
- inline error
- status card
- retry CTA

==================================================
43. STATE MANAGEMENT
==================================================

Inspect existing state management first.

Reuse existing solution.

Do NOT add Redux/Zustand/etc. just because you prefer it.

Only introduce state management if genuinely necessary.

The Individual workflow should preserve progress.

If the user leaves the page and comes back:

their saved progress should remain.

==================================================
44. SOURCE OF TRUTH
==================================================

For tax rules and government processes:

Use official Income Tax Department documentation as the primary source.

Do not copy random tax rules from blogs.

Do not hardcode rules without assessment-year/version information.

Government process documentation must be treated as external-source-dependent.

Official sources:

https://www.incometax.gov.in/

PAN verification:
https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/verify-your-pan

Aadhaar-PAN:
https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/link-aadhaar

==================================================
45. IMPORTANT GOVERNMENT-INTEGRATION RULE
==================================================

Before implementing any direct PAN/Aadhaar/Income Tax API integration:

CHECK whether the required official/authorized API access actually exists for this application.

If credentials/access are not available:

DO NOT invent an API endpoint.

DO NOT scrape the Income Tax website.

DO NOT automate OTP entry.

DO NOT fake government responses.

Instead:

create a clean service interface/adapter:

PanVerificationService
AadhaarPanStatusService
IncomeTaxFilingService
EVerificationService

Then implement:

- real provider adapter when credentials exist
- sandbox/mock adapter only for development

Clearly label mock/sandbox results.

==================================================
46. CLERK INTEGRATION
==================================================

If Clerk is already configured:

Keep it.

Use Clerk for:

- Login
- Register
- Logout
- Session
- Current user

Do NOT create custom password authentication.

Do NOT create custom JWT authentication if Clerk is already being used.

The application flow should be:

Clerk Login
 ↓
TaxPilot User
 ↓
Individual Profile
 ↓
PAN Verification
 ↓
Aadhaar-PAN Status
 ↓
Tax Filing

==================================================
47. IMPORTANT UX PRINCIPLE
==================================================

The user should NEVER feel like they are filling a complicated government form.

TaxPilot should ask questions in simple language.

Instead of:

"Enter aggregate amount under section..."

Use:

"Did you pay for health insurance this year?"

Then:

"How much did you pay?"

Then:

"Upload the receipt."

TaxPilot handles the complexity internally.

==================================================
48. DASHBOARD READINESS CARD
==================================================

Create:

"Filing Readiness"

Example:

Your return is 68% ready.

✓ Account verified
✓ PAN verified
✓ Aadhaar-PAN status checked
✓ Documents uploaded
✓ Income verified
⚠ 1 deduction needs confirmation
○ Final review pending

CTA:

"Continue"

==================================================
49. VISUAL FLOW
==================================================

The final Individual experience should visually communicate:

LOGIN
 ↓
PROFILE
 ↓
PAN VERIFIED
 ↓
AADHAAR-PAN STATUS
 ↓
ELIGIBILITY
 ↓
DOCUMENTS
 ↓
AI EXTRACTION
 ↓
USER CONFIRMATION
 ↓
INCOME
 ↓
DEDUCTIONS
 ↓
TAX CALCULATION
 ↓
OLD VS NEW REGIME
 ↓
VALIDATION
 ↓
TAX SAVINGS
 ↓
FINAL REVIEW
 ↓
APPROVAL
 ↓
FILING
 ↓
E-VERIFICATION
 ↓
COMPLETE

==================================================
50. TESTING
==================================================

Create tests for:

PAN:
- valid PAN
- invalid PAN
- inactive PAN
- name mismatch
- DOB mismatch
- API failure
- rate limit

Aadhaar-PAN:
- linked
- not linked
- pending
- failed
- inoperative
- service unavailable

Workflow:
- user cannot access without authentication
- user cannot access another user's taxpayer data
- verified PAN persists
- Aadhaar-PAN status persists
- progress persists
- user can resume workflow
- cannot approve with critical validation errors
- cannot mark return FILED without actual filing confirmation

Tax:
- calculation engine unit tests
- old/new regime comparison
- validation tests

==================================================
51. ACCEPTANCE CRITERIA
==================================================

The implementation is complete only when:

1. Existing UI is preserved.
2. Existing functionality still works.
3. Clerk authentication works.
4. Individual dashboard works.
5. Personal profile works.
6. PAN verification UI works.
7. PAN verification backend architecture exists.
8. Real provider integration is used if credentials exist.
9. No fake government verification is presented as real.
10. Aadhaar-PAN status UI works.
11. Aadhaar data is protected.
12. Individual progress persists.
13. Eligibility flow works.
14. Document upload works.
15. Extraction flow works.
16. User can verify extracted data.
17. Income section works.
18. Deductions section works.
19. Tax regime comparison works.
20. Tax calculation is deterministic.
21. Validation works.
22. Tax-saving insights work.
23. Final review works.
24. User approval works.
25. Filing state is not falsely marked as FILED.
26. e-Verification is represented correctly.
27. Responsive design works.
28. Error/loading states exist.
29. Tests pass.
30. No unrelated code is unnecessarily modified.

==================================================
52. IMPLEMENTATION ORDER
==================================================

DO NOT implement everything randomly.

Work in this exact order:

PHASE 1
Inspect existing project.

PHASE 2
Document existing architecture and identify reusable components.

PHASE 3
Implement/verify Clerk authentication.

PHASE 4
Implement Individual Dashboard.

PHASE 5
Implement Personal Profile.

PHASE 6
Implement PAN Verification.

PHASE 7
Implement Aadhaar-PAN Link Status.

PHASE 8
Implement Individual verification state and persistence.

PHASE 9
Implement ITR eligibility.

PHASE 10
Implement document collection.

PHASE 11
Implement AI/OCR extraction.

PHASE 12
Implement income.

PHASE 13
Implement deductions.

PHASE 14
Implement tax calculation.

PHASE 15
Implement old/new regime comparison.

PHASE 16
Implement validation.

PHASE 17
Implement tax-saving insights.

PHASE 18
Implement final review.

PHASE 19
Implement approval.

PHASE 20
Implement filing-ready state.

PHASE 21
Implement e-verification state.

PHASE 22
Testing.

PHASE 23
Final cleanup.

==================================================
53. AFTER EACH PHASE
==================================================

After completing each phase:

1. Run the application.
2. Check for TypeScript errors.
3. Check console errors.
4. Check API errors.
5. Check responsive layout.
6. Run relevant tests.
7. Do not proceed if the previous phase is broken.

==================================================
54. FINAL REPORT
==================================================

At the end provide:

1. Files created
2. Files modified
3. Files intentionally untouched
4. Database changes
5. API endpoints created
6. Environment variables required
7. Clerk changes
8. PAN integration status
9. Aadhaar-PAN integration status
10. Which parts are real
11. Which parts are sandbox/mock
12. Tests performed
13. Any remaining limitations
14. Exact commands needed to run the project

IMPORTANT:

Do not claim that PAN/Aadhaar/government verification is real unless it actually calls a legitimate authorized service and receives a real response.

Do not claim that tax filing is complete unless actual filing has been successfully confirmed.

Build TaxPilot as a trustworthy tax-assistance product, not a fake government portal.


One thing I would specifically keep in the implementation
The PAN + Aadhaar section should look like this:
┌──────────────────────────────────────────────┐
│ Taxpayer Verification                        │
│                                              │
│ PAN                                          │
│ ✓ Verified                                   │
│ ABCD••••4F                                   │
│ Name & DOB matched                           │
│                                              │
│ Aadhaar–PAN Link                             │
│ ✓ Linked                                     │
│ Your PAN and Aadhaar are linked              │
│                                              │
│ Identity Status                              │
│ ✓ Ready for tax filing                      │
│                                              │
│              [ Continue → ]                  │
└──────────────────────────────────────────────┘

And if Aadhaar-PAN isn't linked:
┌──────────────────────────────────────────────┐
│ ⚠ Action Required                           │
│                                              │
│ PAN ✓ Verified                               │
│                                              │
│ Aadhaar–PAN Link ⚠ Not Confirmed             │
│                                              │
│ Your PAN-Aadhaar linkage could not be        │
│ confirmed. Resolve this through the          │
│ official Income Tax process.                 │
│                                              │
│ [ Resolve on Income Tax Portal ]             │
│ [ Check Status Again ]                       │
└──────────────────────────────────────────────┘