export interface SendSmsParams {
  to: string;
  message: string;
  marketing?: boolean;
  senderId?: string;
  test?: boolean;
}

export interface SendSmsResult {
  success: boolean;
  message_id: string;
  provider_message_id: string;
  status: string;
  segments: number;
  credits_remaining: number;
}

export interface OtpSendResult {
  verification_id: string;
  test_mode: boolean;
  note: string;
}

export interface OtpVerifyResult {
  verified: boolean;
}

export interface BalanceResult {
  credits: number;
  email: string;
  company: string;
  low_credit: boolean;
  kyc_status: string;
  [key: string]: unknown;
}

export interface BremlioOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export class BremlioError extends Error {
  status?: number;
  body?: unknown;
}

export class Bremlio {
  constructor(apiKey?: string, opts?: BremlioOptions);
  sendSms(params: SendSmsParams): Promise<SendSmsResult>;
  sendBulk(messages: Array<{ to: string; message: string }>): Promise<unknown>;
  sendOtp(to: string): Promise<OtpSendResult>;
  verifyOtp(verificationId: string, code: string): Promise<OtpVerifyResult>;
  balance(): Promise<BalanceResult>;
}
