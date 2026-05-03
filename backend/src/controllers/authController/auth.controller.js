const asyncHandler = require('../../utils/asyncHandler');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const logAudit = require('../../utils/auditLog');
const {
  USER_ROLES,
  USER_STATUSES,
  createToken,
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

  res.status(201).json({
    message: 'Registration submitted. Your account is waiting for admin approval.',
    email: user.email
  });
});

module.exports = {
  login,
  register
};
