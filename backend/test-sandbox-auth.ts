import { authenticateSandbox } from './src/services/sandbox.service';

async function runTest() {
  console.log('Testing Sandbox Authentication...');
  try {
    const token = await authenticateSandbox();
    console.log('✅ Sandbox Authentication Successful!');
    console.log('Access token received (partially masked):', token.substring(0, 15) + '...[MASKED]');
  } catch (error) {
    console.error('❌ Sandbox Authentication Failed!');
    console.error(error);
    process.exit(1);
  }
}

runTest();
