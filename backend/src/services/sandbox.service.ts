import { config, validateSandboxConfig } from '../config';

export class ProviderError extends Error {
  public statusCode?: number;
  public isNetworkError: boolean;
  public providerResponse?: any;
  public step: string;

  constructor(message: string, step: string, statusCode?: number, isNetworkError: boolean = false, providerResponse?: any) {
    super(message);
    this.name = 'ProviderError';
    this.step = step;
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    this.providerResponse = providerResponse;
  }
}

async function safeFetch(url: string, options: RequestInit, step: string) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error: any) {
    throw new ProviderError(`Network error during ${step}: ${error.message}`, step, undefined, true);
  }

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = 'Could not read error body';
    }
    throw new ProviderError(
      `${step} failed with status ${response.status}: ${errorText}`,
      step,
      response.status,
      false,
      errorText
    );
  }

  return response;
}

export const authenticateSandbox = async (): Promise<string> => {
  const { apiKey, apiSecret, baseUrl } = validateSandboxConfig();
  const url = `${baseUrl}/authenticate`;
  
  const response = await safeFetch(url, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'x-api-secret': apiSecret, 'accept': 'application/json', 'Content-Type': 'application/json' }
  }, 'authenticateSandbox');

  const data = await response.json() as any;
  const accessToken = data.access_token || data.data?.access_token;
  if (!accessToken) {
    throw new ProviderError('Authentication succeeded but no access token was returned.', 'authenticateSandbox', 200, false, data);
  }
  return accessToken;
};

export const prepareItrJson = async (payload: any, token: string, year?: string): Promise<any> => {
  const { apiKey, baseUrl } = validateSandboxConfig();
  const reportYear = year || payload?.reportYear || '2025';
  const url = `${baseUrl}/it/report/${reportYear}/itr`;
  const response = await safeFetch(url, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${token}`, 'accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'prepareItrJson');
  return response.json();
};

export const loginEri = async (): Promise<string> => {
  throw new ProviderError('ERI Integration Blocked: Missing Sandbox ERI API test credentials and product scopes.', 'loginEri', 403, false);
};

export const validateItr = async (itrJson: any, itdToken: string): Promise<any> => {
  const { apiKey, baseUrl } = validateSandboxConfig();
  const url = `${baseUrl}/itd/portal/tax-payer/itrs/validate`;
  const response = await safeFetch(url, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Authorization': itdToken, 'accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ITR: itrJson })
  }, 'validateItr');
  return response.json();
};

export const submitItr = async (itrJson: any, itdToken: string): Promise<any> => {
  const { apiKey, baseUrl } = validateSandboxConfig();
  const url = `${baseUrl}/itd/portal/tax-payer/itrs/e-file`;
  const response = await safeFetch(url, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Authorization': itdToken, 'accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ITR: itrJson })
  }, 'submitItr');
  return response.json();
};

export const getFilingStatus = async (itdToken: string): Promise<any> => {
  const { apiKey, baseUrl } = validateSandboxConfig();
  const url = `${baseUrl}/itd/portal/tax-payer/itrs`;
  const response = await safeFetch(url, {
    method: 'GET',
    headers: { 'x-api-key': apiKey, 'Authorization': itdToken, 'accept': 'application/json' }
  }, 'getFilingStatus');
  return response.json();
};

export const getAcknowledgementPdf = async (ackNumber: string, itdToken: string): Promise<string> => {
  const { apiKey, baseUrl } = validateSandboxConfig();
  const url = `${baseUrl}/itd/portal/tax-payer/itrs/pdf?acknowledgement_number=${encodeURIComponent(ackNumber)}`;
  const response = await safeFetch(url, {
    method: 'GET',
    headers: { 'x-api-key': apiKey, 'Authorization': itdToken, 'accept': 'application/json' }
  }, 'getAcknowledgementPdf');
  
  const data = await response.json() as any;
  if (!data.data?.pdf) {
    throw new ProviderError('PDF retrieval succeeded but no URL was found.', 'getAcknowledgementPdf', 200, false, data);
  }
  return data.data.pdf;
};
