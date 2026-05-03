const asyncHandler = require('../../utils/asyncHandler');
const { User } = require('../../models');
const { PUBLIC_USER_ATTRIBUTES, USER_STATUSES, verifyToken } = require('../../utils/auth');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }

  const user = await User.findByPk(payload.id, {
    attributes: PUBLIC_USER_ATTRIBUTES
  });

  if (!user) {
    return res.status(401).json({ message: 'User account was not found' });
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

  req.user = user;
  next();
});

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication is required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this route' });
    }

    next();
  };
}

function requireSameEmployee(req, res, next) {
  if (Number(req.params.employeeId) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'You can only access your own employee data' });
  }

  next();
}

module.exports = {
  authenticate,
  authorizeRoles,
  requireSameEmployee
};
