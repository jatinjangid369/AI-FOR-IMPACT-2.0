const crypto = require('crypto');

// Generate a 6-digit numeric OTP
const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, expiresAt };
};

module.exports = { generateOtp };
