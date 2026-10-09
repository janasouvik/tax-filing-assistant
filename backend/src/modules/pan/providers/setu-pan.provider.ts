import type { PanProvider } from './pan.provider';
import type { PanVerifyInput, PanVerificationResult } from '../pan.types';
import { AppError } from '../../../utils/response';

/** Raw documented Setu success response shape */
interface SetuPanResponse {
  data?: {
    aadhaar_seeding_status?: string;
    category?: string;
    full_name?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
  message?: string;
  verification?: string; // "success" | "failed"
  traceId?: string;
}

const SETU_PAN_REASON = 'PAN verification for TaxPilot tax filing assistance';
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * SetuPanProvider
 *
 * Calls the Setu PAN Verification API:
 *   POST https://dg-sandbox.setu.co/api/verify/pan
 *
 * Required env vars (server-side only):
 *   SETU_BASE_URL, SETU_CLIENT_ID, SETU_CLIENT_SECRET, SETU_PRODUCT_INSTANCE_ID
 *
 * Security:
 *   - Credentials are NEVER received from, or returned to, the frontend.
 *   - Full PAN is NEVER logged.
 *   - Setu secrets are NEVER logged.
 */
export class SetuPanProvider implements PanProvider {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly productInstanceId: string;

  constructor() {
    const baseUrl = process.env.SETU_BASE_URL;
    const clientId = process.env.SETU_CLIENT_ID;
    const clientSecret = process.env.SETU_CLIENT_SECRET;
    const productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID;

    if (!baseUrl || !clientId || !clientSecret || !productInstanceId) {
      throw new AppError(
        'Setu PAN provider is not configured. Required: SETU_BASE_URL, SETU_CLIENT_ID, SETU_CLIENT_SECRET, SETU_PRODUCT_INSTANCE_ID',
        500,
        'CONFIG_ERROR'
      );
    }

    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.productInstanceId = productInstanceId;
  }

  async verifyPan(input: PanVerifyInput): Promise<PanVerificationResult> {
    const url = `${this.baseUrl}/api/verify/pan`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId,
          'x-client-secret': this.clientSecret,
          'x-product-instance-id': this.productInstanceId,
        },
        body: JSON.stringify({
          pan: input.pan,
          consent: input.consent,
          reason: SETU_PAN_REASON,
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new AppError('PAN verification request timed out', 504, 'SETU_TIMEOUT');
      }
      throw new AppError('Network error reaching PAN verification service', 503, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }

    let body: SetuPanResponse;
    try {
      body = (await response.json()) as SetuPanResponse;
    } catch {
      throw new AppError('Invalid response from PAN verification service', 502, 'SETU_SERVER_ERROR');
    }

    // Authentication / configuration errors
    if (response.status === 401 || response.status === 403) {
      throw new AppError('PAN verification service authentication failed. Check Setu credentials.', 500, 'SETU_AUTH_ERROR');
    }

    // Setu returns 404 when the PAN is not found
    if (response.status === 404) {
      return {
        verification: 'failed',
        message: 'PAN could not be found.',
        traceId: body.traceId,
        verificationProvider: 'setu',
      };
    }

    // Setu 4xx for bad request (e.g. invalid consent / reason)
    if (response.status === 400) {
      return {
        verification: 'failed',
        message: body.message || 'PAN verification request was rejected.',
        traceId: body.traceId,
        verificationProvider: 'setu',
      };
    }

    // 5xx — Setu server error
    if (response.status >= 500) {
      throw new AppError('PAN verification service is temporarily unavailable', 503, 'SETU_SERVER_ERROR');
    }

    // 200 response — parse the documented fields
    // Setu may not return a "verification" string, so HTTP 200 is our primary success indicator.
    const setuVerification = body.verification; 
    const isSuccess = response.status === 200 && (setuVerification === undefined || String(setuVerification).toLowerCase() === 'success');

    return {
      verification: isSuccess ? 'success' : 'failed',
      message: body.message,
      traceId: body.traceId,
      verificationProvider: 'setu',
      data: isSuccess && body.data
        ? {
          category: body.data.category,
          fullName: body.data.full_name,
          firstName: body.data.first_name,
          middleName: body.data.middle_name,
          lastName: body.data.last_name,
          // aadhaar_seeding_status is optional per Setu docs — never invent a value
          aadhaarSeedingStatus: body.data.aadhaar_seeding_status ?? null,
        }
        : undefined,
    };
  }
}
