const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);
}

function createTransporter() {
  const auth =
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth
  });
}

async function sendOtpEmail(email, otp) {
  const message = `Your EvalSystem verification code is ${otp}. It expires in ${
    process.env.OTP_EXPIRES_MINUTES || 10
  } minutes.`;

  if (!hasSmtpConfig()) {
    console.log(`[DEV OTP] ${email}: ${otp}`);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'EvalSystem email verification code',
    text: message
  });
}

module.exports = {
  sendOtpEmail
};
