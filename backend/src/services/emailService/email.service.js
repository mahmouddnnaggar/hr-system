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

async function sendEmail({ to, subject, text }) {
  if (!to) {
    return;
  }

  if (!hasSmtpConfig()) {
    console.log(`[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${subject}`);
    console.log(`[DEV EMAIL] ${text}`);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
}

async function sendPasswordResetEmail(user, otp) {
  await sendEmail({
    to: user.email,
    subject: 'EvalSystem password reset code',
    text: `Your password reset code is ${otp}. It expires in ${process.env.RESET_OTP_EXPIRES_MINUTES || 10} minutes.`
  });
}

async function sendAccountStatusEmail(user, status) {
  await sendEmail({
    to: user.email,
    subject: `EvalSystem account ${status.toLowerCase()}`,
    text:
      status === 'APPROVED'
        ? 'Your account has been approved. You can now log in.'
        : 'Your account has been rejected by admin.'
  });
}

async function sendExamAssignedEmail(user, exam) {
  await sendEmail({
    to: user.email,
    subject: 'New EvalSystem exam assigned',
    text: `A new exam was assigned to you: ${exam.title}.`
  });
}

async function sendExamCompletedEmail(user, examTitle) {
  await sendEmail({
    to: user.email,
    subject: 'EvalSystem exam completed',
    text: `Exam completed: ${examTitle}.`
  });
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendAccountStatusEmail,
  sendExamAssignedEmail,
  sendExamCompletedEmail
};
