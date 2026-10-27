# bremlio-node

A tiny Node.js client for the [Bremlio](https://www.bremlio.com) UK SMS and OTP API.

Bremlio is a UK SMS and OTP API: send text messages and one-time passcodes to UK mobile numbers over a simple REST API, pay as you go from 4.65p per SMS. Get a free API key at [bremlio.com/dashboard.html](https://www.bremlio.com/dashboard.html) (25 free credits on signup).

No dependencies. Uses the built-in `fetch`, so it needs Node.js 18 or newer.

## Install

This is a small single-file client. Copy `index.js` into your project, or install from the repo:

```bash
npm install ekukhuleni/bremlio-node
```

## Quickstart

```js
const { Bremlio } = require('bremlio');

// Reads BREMLIO_API_KEY from the environment, or pass the key directly.
const bremlio = new Bremlio(process.env.BREMLIO_API_KEY);

// Send an SMS to a UK mobile (+44).
const res = await bremlio.sendSms({
  to: '+447700900123',
  message: 'Hello from Bremlio!',
});
console.log(res.message_id, res.credits_remaining);
```

## Send and verify a one-time passcode

```js
const otp = await bremlio.sendOtp('+447700900123');
// otp.verification_id

// After the user enters the code they received:
const check = await bremlio.verifyOtp(otp.verification_id, '123456');
if (check.verified) {
  console.log('verified');
}
```

## Check your balance

```js
const bal = await bremlio.balance();
console.log(bal.credits, bal.kyc_status);
```

## API

| Method | Calls | Returns |
| --- | --- | --- |
| `sendSms({ to, message, marketing?, senderId?, test? })` | `POST /v1/messages` | `{ success, message_id, provider_message_id, status, segments, credits_remaining }` |
| `sendBulk(messages)` | `POST /v1/messages/bulk` | bulk send result |
| `sendOtp(to)` | `POST /v1/otp/send` | `{ verification_id, test_mode, note }` |
| `verifyOtp(verificationId, code)` | `POST /v1/otp/verify` | `{ verified }` |
| `balance()` | `GET /v1/balance` | `{ credits, email, company, low_credit, kyc_status, ... }` |

All requests send the `X-Api-Key` header against the base URL `https://api.bremlio.com`.

Pass `{ test: true }` to `sendSms` to validate a request without charging credits or sending a real message.

## Notes and limits

- Bremlio sends to UK mobile numbers (+44) only. It does not offer voice, WhatsApp, email or international SMS.
- Errors throw a `BremlioError` with `.status` and `.body` from the API response.
- Never hard-code your API key. Use an environment variable (`BREMLIO_API_KEY`).

## Links

- Website: https://www.bremlio.com
- API docs: https://www.bremlio.com/developers.html
- Pricing: https://www.bremlio.com/pricing/

## License

MIT. See [LICENSE](LICENSE). Bremlio is a product of Bremlio Ltd (UK company number 17444792).
