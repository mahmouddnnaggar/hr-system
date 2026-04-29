const { User } = require('../models');

const seedUsers = async () => {
  const users = [
    { name: 'HR User 1', email: 'hr1@test.com', role: 'HR' },
    { name: 'HR User 2', email: 'hr2@test.com', role: 'HR' },
    { name: 'HR User 3', email: 'hr3@test.com', role: 'HR' },
    { name: 'Employee 1', email: 'employee1@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 2', email: 'employee2@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 3', email: 'employee3@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 4', email: 'employee4@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 5', email: 'employee5@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 6', email: 'employee6@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 7', email: 'employee7@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 8', email: 'employee8@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 9', email: 'employee9@test.com', role: 'EMPLOYEE' },
    { name: 'Employee 10', email: 'employee10@test.com', role: 'EMPLOYEE' }
  ];

  await User.bulkCreate(users);
  console.log('Users seeded successfully');
};

module.exports = seedUsers;
