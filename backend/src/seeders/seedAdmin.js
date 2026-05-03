const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');
const { USER_ROLES, USER_STATUSES, normalizeEmail } = require('../utils/auth');
const ensureDateColumns = require('../utils/ensureDateColumns');

const DEFAULT_ADMIN_EMAIL = 'mahmoudelnaggar@admin.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

function getAdminInput() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD);
  const name = String(process.env.ADMIN_NAME || 'Default Admin').trim();

  if (!email) {
    throw new Error('ADMIN_EMAIL is required');
  }

  if (password.length < 6) {
    throw new Error('ADMIN_PASSWORD must be at least 6 characters');
  }

  return { email, password, name };
}

async function seedAdmin() {
  const { email, password, name } = getAdminInput();
  const passwordHash = await bcrypt.hash(password, 12);
  const existingAdmin = await User.findOne({ where: { email } });
  const adminData = {
    name,
    email,
    password_hash: passwordHash,
    role: USER_ROLES.ADMIN,
    status: USER_STATUSES.APPROVED,
    deleted_at: null,
    deleted_by: null
  };

  if (existingAdmin) {
    await existingAdmin.update(adminData);
    console.log(`Admin account updated: ${email}`);
  } else {
    await User.create(adminData);
    console.log(`Admin account created: ${email}`);
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD was not set. The default password was used.');
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    await ensureDateColumns(sequelize);
    await seedAdmin();
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Admin seed failed:', error.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

run();
