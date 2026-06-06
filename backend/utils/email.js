const fetch = require('node-fetch');

/**
 * Send a generic email using Brevo (Sendinblue) SMTP API.
 * Expected environment variables:
 *   BREVO_API_KEY – your Brevo API key
 *   BREVO_SENDER_EMAIL – the verified sender email address
 *   BREVO_SENDER_NAME – optional sender name
 */
async function sendMail(to, subject, html) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not set in environment');

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || 'CampusGenie',
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo email send failed: ${response.status} ${err}`);
  }
  return response.json();
}

/**
 * Helper to send an OTP email. Uses a simple HTML template.
 */
async function sendOtp(to, otp) {
  const subject = 'Your CampusGenie OTP Code';
  const html = `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`;
  return sendMail(to, subject, html);
}

module.exports = { sendMail, sendOtp };
