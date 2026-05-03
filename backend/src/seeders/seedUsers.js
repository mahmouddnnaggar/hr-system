const bcrypt = require('bcrypt');
const { User } = require('../models');
const { USER_ROLES, USER_STATUSES } = require('../utils/auth');

const ADMIN_EMAIL = 'mahmoudelnaggar@admin.com';
const ADMIN_PASSWORD = 'Admin123!';
const DEMO_PASSWORD = 'Demo123!';

const seedUsers = async () => {
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const users = [
    { name: 'HR User 1', email: 'hr1@test.com', role: USER_ROLES.HR },
    { name: 'HR User 2', email: 'hr2@test.com', role: USER_ROLES.HR },
    { name: 'HR User 3', email: 'hr3@test.com', role: USER_ROLES.HR },
    { name: 'Employee 1', email: 'employee1@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 2', email: 'employee2@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 3', email: 'employee3@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 4', email: 'employee4@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 5', email: 'employee5@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 6', email: 'employee6@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 7', email: 'employee7@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 8', email: 'employee8@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 9', email: 'employee9@test.com', role: USER_ROLES.EMPLOYEE },
    { name: 'Employee 10', email: 'employee10@test.com', role: USER_ROLES.EMPLOYEE }
  ].map((user) => ({
    ...user,
    password_hash: demoPasswordHash,
    status: USER_STATUSES.APPROVED,
    is_email_verified: true
  }));

  users.push({
    name: 'Default Admin',
    email: ADMIN_EMAIL,
    password_hash: adminPasswordHash,
    role: USER_ROLES.ADMIN,
    status: USER_STATUSES.APPROVED,
    is_email_verified: true
  });

  await User.bulkCreate(users);

  console.log('Users seeded successfully');
  console.log(`Default admin: ${ADMIN_EMAIL}`);
  console.log(`Default admin password: ${ADMIN_PASSWORD}`);
  console.log(`Demo HR/Employee password: ${DEMO_PASSWORD}`);
};

module.exports = seedUsers;
