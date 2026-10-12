import { authenticateSandbox } from './src/services/sandbox.service';
import { validateSandboxConfig } from './src/config';

(async () => {
  try {
    const token = await authenticateSandbox();
    const { apiKey, baseUrl } = validateSandboxConfig();
    const res = await fetch(baseUrl + '/itd/portal/tax-payer/itrs', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch(e) { console.error(e) }
})()
