Implement Setu PAN Verification in my existing TaxPilot project.
First inspect the existing frontend and Node.js/Express/TypeScript backend. Do not redesign or modify unrelated functionality.
Use the official Setu PAN API documentation: https://docs.setu.co/data/pan/quickstart
Requirements:
1. Create a clean PAN verification module in the existing backend.
2. Create a PanProvider interface and a SetuPanProvider implementation.
3. Add POST /api/pan/verify.
4. Validate PAN format before calling Setu.
5. Require explicit user consent.
6. Send PAN, consent=Y, and a reason of at least 20 characters to Setu.
7. Use the Setu sandbox endpoint initially: https://dg-sandbox.setu.co.
8. Keep SETU_CLIENT_ID, SETU_CLIENT_SECRET, and SETU_PRODUCT_INSTANCE_ID strictly server-side.
9. Parse and return PAN verification status, category, full name, and aadhaar_seeding_status when supplied by Setu.
10. Store the verification result in PostgreSQL using the project's existing database architecture.
11. Never log the full PAN, Setu secret, or other sensitive credentials.
12. Connect the existing TaxPilot PAN verification UI to the backend without redesigning the existing UI.
13. Add proper error handling for invalid PAN, 400, 404, authentication failure, timeout, and Setu errors.
14. Add a mock provider so development can continue without Setu credentials.
15. Add tests for valid PAN, invalid PAN, missing consent, invalid PAN format, and missing API credentials.
16. Do not invent undocumented Setu endpoints, fields, authentication mechanisms, or response values. Follow the official documentation exactly.
17. After implementation, run the tests and TypeScript build and report every changed file.