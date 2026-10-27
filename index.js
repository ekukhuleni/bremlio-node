/**
 * bremlio-node: a tiny client for the Bremlio UK SMS and OTP API.
 *
 * Bremlio is a UK SMS and OTP API (UK +44 mobiles only). This wrapper covers the
 * public send and verify endpoints. No dependencies: it uses the built-in global
 * fetch (Node.js 18 or newer).
 *
 * API base:   https://api.bremlio.com
 * Auth:       X-Api-Key header (get a key free at https://www.bremlio.com/dashboard.html)
 *
 * Endpoints used (verified against the live API):
 *   POST /v1/messages        send one SMS
 *   POST /v1/messages/bulk   send up to many in one call
 *   POST /v1/otp/send        send a one-time passcode
 *   POST /v1/otp/verify      verify a one-time passcode
 *   GET  /v1/balance         check remaining credits
 */

'use strict';

const DEFAULT_BASE_URL = 'https://api.bremlio.com';

class BremlioError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'BremlioError';
    this.status = status;
    this.body = body;
  }
}

class Bremlio {
  /**
   * @param {string} apiKey  Your Bremlio API key. Falls back to process.env.BREMLIO_API_KEY.
   * @param {object} [opts]
   * @param {string} [opts.baseUrl]  Override the API base URL.
   * @param {function} [opts.fetch]  Override the fetch implementation (defaults to global fetch).
   */
  constructor(apiKey = process.env.BREMLIO_API_KEY, opts = {}) {
    if (!apiKey) {
      throw new BremlioError('Missing API key. Pass one or set BREMLIO_API_KEY.');
    }
    this.apiKey = apiKey;
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this._fetch = opts.fetch || globalThis.fetch;
    if (typeof this._fetch !== 'function') {
      throw new BremlioError('No fetch available. Use Node.js 18+ or pass opts.fetch.');
    }
  }

  async _request(method, path, body) {
    const res = await this._fetch(this.baseUrl + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let data = null;
    try {
      data = await res.json();
    } catch (_e) {
      // non-JSON response; leave data null
    }
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new BremlioError(msg, res.status, data);
    }
    return data;
  }

  /**
   * Send a single SMS to a UK mobile.
   * @param {object} params
   * @param {string} params.to        UK mobile in 07... or +44... format.
   * @param {string} params.message   Message text (up to 480 chars).
   * @param {boolean} [params.marketing]  Mark as marketing (adds PECR opt-out footer).
   * @param {string} [params.senderId]    Approved sender ID.
   * @param {boolean} [params.test]       Test mode: validate without charging or sending.
   * @returns {Promise<object>} { success, message_id, provider_message_id, status, segments, credits_remaining }
   */
  sendSms({ to, message, marketing, senderId, test } = {}) {
    const body = { to, message };
    if (marketing !== undefined) body.marketing = marketing;
    if (senderId !== undefined) body.sender_id = senderId;
    if (test !== undefined) body.test = test;
    return this._request('POST', '/v1/messages', body);
  }

  /**
   * Send many messages in one call.
   * @param {Array<{to: string, message: string}>} messages
   * @returns {Promise<object>}
   */
  sendBulk(messages) {
    return this._request('POST', '/v1/messages/bulk', { messages });
  }

  /**
   * Send a one-time passcode by SMS to a UK mobile.
   * @param {string} to  UK mobile in 07... or +44... format.
   * @returns {Promise<object>} { verification_id, test_mode, note }
   */
  sendOtp(to) {
    return this._request('POST', '/v1/otp/send', { to });
  }

  /**
   * Verify a one-time passcode.
   * @param {string} verificationId  The verification_id returned by sendOtp.
   * @param {string} code            The code the user entered.
   * @returns {Promise<object>} { verified: true } on success.
   */
  verifyOtp(verificationId, code) {
    return this._request('POST', '/v1/otp/verify', {
      verification_id: verificationId,
      code,
    });
  }

  /**
   * Get the account balance and status.
   * @returns {Promise<object>} { credits, email, company, low_credit, kyc_status, ... }
   */
  balance() {
    return this._request('GET', '/v1/balance');
  }
}

module.exports = { Bremlio, BremlioError };
