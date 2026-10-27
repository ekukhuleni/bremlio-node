/**
 * Quickstart example for the Bremlio Node client.
 * Run with: BREMLIO_API_KEY=your_key node example.js
 */
const { Bremlio } = require('./index');

async function main() {
  const bremlio = new Bremlio(process.env.BREMLIO_API_KEY);

  // Send a single SMS to a UK mobile.
  const sent = await bremlio.sendSms({
    to: '+447700900123',
    message: 'Hello from Bremlio!',
  });
  console.log('sent:', sent);

  // Send and verify a one-time passcode.
  const otp = await bremlio.sendOtp('+447700900123');
  console.log('otp sent:', otp);
  // In a real app, read the code the user received, then:
  // const check = await bremlio.verifyOtp(otp.verification_id, '123456');
  // console.log('verified:', check);

  // Check remaining credits.
  const bal = await bremlio.balance();
  console.log('credits:', bal.credits);
}

main().catch((err) => {
  console.error('error:', err.message, err.status || '');
  process.exit(1);
});
