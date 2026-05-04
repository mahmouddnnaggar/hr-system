const asyncHandler = require('../../utils/asyncHandler');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const logAudit = require('../../utils/auditLog');
const { sendEmail, sendPasswordResetEmail } = require('../../services/emailService/email.service');
const {
  USER_ROLES,
  USER_STATUSES,
  createToken,
  createRefreshToken,
  generateOtp,
  getResetOtpExpiresAt,
  hashValue,
  normalizeEmail,
  normalizeRole,
  sanitizeUser,
  verifyRefreshToken
} = require('../../utils/auth');

async function buildAuthResponse(user) {
  const token = createToken(user);
  const refreshToken = createRefreshToken(user);

  await user.update({ refresh_token_hash: hashValue(refreshToken) });

  return {
    message: 'Login successful',
    token,
    refreshToken,
    user: sanitizeUser(user)
  };
}

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

  if (user.deleted_at) {
    return res.status(403).json({ message: 'This account has been removed.' });
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

  res.json(await buildAuthResponse(user));
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

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: normalizedRole,
    status: USER_STATUSES.PENDING
  });

  await logAudit({
    actorId: null,
    action: 'REGISTER_USER',
    entityType: 'User',
    entityId: user.id,
    message: `Registered ${user.role} user ${user.email}`
  });
  await sendEmail({
    to: user.email,
    subject: 'EvalSystem registration received',
    text: 'Your account was created and is waiting for admin approval.'
  });

  res.status(201).json({
    message: 'Registration submitted. Your account is waiting for admin approval.',
    email: user.email
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ where: { email, deleted_at: null } });

  // Keep the response generic so attackers cannot check if an email exists.
  if (!user) {
    return res.json({ message: 'If this email exists, a reset code has been sent.' });
  }

  const otp = generateOtp();

  await user.update({
    reset_otp_hash: hashValue(otp),
    reset_otp_expires_at: getResetOtpExpiresAt()
  });
  await sendPasswordResetEmail(user, otp);
  await logAudit({
    actorId: user.id,
    action: 'REQUEST_PASSWORD_RESET',
    entityType: 'User',
    entityId: user.id,
    message: `Password reset requested for ${user.email}`
  });

  res.json({ message: 'If this email exists, a reset code has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const user = await User.findOne({ where: { email, deleted_at: null } });

  if (!user || !user.reset_otp_hash || !user.reset_otp_expires_at) {
    return res.status(400).json({ message: 'Invalid or expired reset code' });
  }

  if (new Date(user.reset_otp_expires_at).getTime() < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired reset code' });
  }

  if (hashValue(otp) !== user.reset_otp_hash) {
    return res.status(400).json({ message: 'Invalid or expired reset code' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await user.update({
    password_hash: passwordHash,
    reset_otp_hash: null,
    reset_otp_expires_at: null,
    refresh_token_hash: null
  });
  await logAudit({
    actorId: user.id,
    action: 'RESET_PASSWORD',
    entityType: 'User',
    entityId: user.id,
    message: `Password reset completed for ${user.email}`
  });

  res.json({ message: 'Password reset successfully. You can now log in.' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  const user = await User.findByPk(payload.id);

  if (!user || user.deleted_at || user.status !== USER_STATUSES.APPROVED || user.refresh_token_hash !== hashValue(token)) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  res.json(await buildAuthResponse(user));
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (token) {
    const tokenHash = hashValue(token);
    await User.update({ refresh_token_hash: null }, { where: { refresh_token_hash: tokenHash } });
  }

  res.json({ message: 'Logged out successfully' });
});

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
};
