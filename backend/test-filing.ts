import { authenticateSandbox, prepareItrJson, loginEri, validateItr, submitItr, getFilingStatus } from './src/services/sandbox.service';

async function runTest() {
  console.log('Testing Sandbox Filing Endpoints...');
  try {
    const sandboxToken = await authenticateSandbox();
    console.log('✅ Sandbox Auth Token Received');

    // 1. Try to prepare ITR JSON
    console.log('\n--- 1. Testing ITR Preparation ---');
    try {
      await prepareItrJson({}, sandboxToken);
      console.log('✅ ITR Preparation succeeded');
    } catch (e: any) {
      console.log('⚠️ ITR Preparation failed (Expected if not enabled or empty payload):', e.message.substring(0, 100));
    }

    // 2. Try to Login via ERI
    console.log('\n--- 2. Testing ERI Login (Security Requirement) ---');
    let itdToken = '';
    try {
      itdToken = await loginEri();
      console.log('✅ ERI Login succeeded! ITD Token received:', itdToken.substring(0, 15) + '...');
    } catch (e: any) {
      console.log('⚠️ ERI Login blocked/failed:', e.message.substring(0, 100));
      console.log('Skipping further filing tests since we lack an ERI session token.');
      return;
    }

    // 3. Try to Validate ITR
    console.log('\n--- 3. Testing ITR Validation ---');
    try {
      const validateRes = await validateItr({}, itdToken);
      console.log('✅ ITR Validation succeeded!', validateRes);
    } catch (e: any) {
      console.log('⚠️ ITR Validation failed:', e.message.substring(0, 100));
    }

    // 4. Try to E-File ITR
    console.log('\n--- 4. Testing ITR E-Filing (Submission) ---');
    try {
      const submitRes = await submitItr({}, itdToken);
      console.log('✅ ITR Submission succeeded!', submitRes);
    } catch (e: any) {
      console.log('⚠️ ITR Submission failed:', e.message.substring(0, 100));
    }

    // 5. Try to get filing status
    console.log('\n--- 5. Testing Filing Status ---');
    try {
      const statusRes = await getFilingStatus(itdToken);
      console.log('✅ Filing Status retrieved!', statusRes);
    } catch (e: any) {
      console.log('⚠️ Filing Status fetch failed:', e.message.substring(0, 100));
    }

  } catch (error) {
    console.error('❌ Critical Test Error:', error);
  }
}

runTest();
