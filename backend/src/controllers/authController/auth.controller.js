const asyncHandler = require('../../utils/asyncHandler');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { sendOtpEmail } = require('../../services/emailService/email.service');
const {
  USER_ROLES,
  USER_STATUSES,
  createToken,
  generateOtp,
  getOtpExpiresAt,
  hashOtp,
  normalizeEmail,
  normalizeRole,
  sanitizeUser
} = require('../../utils/auth');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({
    where: { email: normalizedEmail }
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.is_email_verified) {
    return res.status(403).json({ message: 'Please verify your email before logging in.' });
  }

  if (user.status === USER_STATUSES.PENDING) {
    return res.status(403).json({ message: 'Your account is waiting for admin approval.' });
  }

  if (user.status === USER_STATUSES.REJECTED) {
    return res.status(403).json({ message: 'Your account has been rejected by admin.' });
  }

  if (user.status !== USER_STATUSES.APPROVED) {
    return res.status(403).json({ message: 'Your account is not approved.' });
  }

  if (!user.password_hash) {
    return res.status(400).json({ message: 'Password login is not set for this account. Please run the seed command.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    token: createToken(user),
    user: sanitizeUser(user)
  });
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = normalizeRole(role);

  if (!name || !normalizedEmail || !password || !normalizedRole) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  if (![USER_ROLES.HR, USER_ROLES.EMPLOYEE].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Only HR and Employee accounts can register' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });

  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const otp = generateOtp();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: normalizedRole,
    status: USER_STATUSES.PENDING,
    is_email_verified: false,
    otp_hash: hashOtp(otp),
    otp_expires_at: getOtpExpiresAt()
  });

  await sendOtpEmail(user.email, otp);

  res.status(201).json({
    message: 'OTP sent to your email. Please verify your email to continue.',
    email: user.email
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.is_email_verified) {
    return res.json({ message: 'Your account is waiting for admin approval.' });
  }

  if (!user.otp_hash || !user.otp_expires_at || new Date(user.otp_expires_at).getTime() < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
  }

  if (hashOtp(otp) !== user.otp_hash) {
    return res.status(400).json({ message: 'Invalid OTP code' });
  }

  await user.update({
    is_email_verified: true,
    otp_hash: null,
    otp_expires_at: null
  });

  res.json({ message: 'Your account is waiting for admin approval.' });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.is_email_verified) {
    return res.status(400).json({ message: 'Email is already verified' });
  }

  const otp = generateOtp();

  await user.update({
    otp_hash: hashOtp(otp),
    otp_expires_at: getOtpExpiresAt()
  });

  await sendOtpEmail(user.email, otp);

  res.json({ message: 'A new OTP has been sent to your email.' });
});

module.exports = {
  login,
  register,
  verifyOtp,
  resendOtp
};
