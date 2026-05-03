const jwt = require('jsonwebtoken');

const USER_ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE'
};

const USER_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

const PUBLIC_USER_ATTRIBUTES = [
  'id',
  'name',
  'email',
  'role',
  'status',
  'deleted_at',
  'deleted_by'
];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeRole(role) {
  const value = String(role || '').trim().toUpperCase();
  return Object.values(USER_ROLES).includes(value) ? value : null;
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function sanitizeUser(user) {
  const plainUser = user?.toJSON ? user.toJSON() : user;

  if (!plainUser) {
    return null;
  }

  return {
    id: plainUser.id,
    name: plainUser.name,
    email: plainUser.email,
    role: plainUser.role,
    status: plainUser.status,
    deletedAt: plainUser.deleted_at || null,
    deletedBy: plainUser.deleted_by || null
  };
}

module.exports = {
  USER_ROLES,
  USER_STATUSES,
  PUBLIC_USER_ATTRIBUTES,
  normalizeEmail,
  normalizeRole,
  createToken,
  verifyToken,
  sanitizeUser
};
