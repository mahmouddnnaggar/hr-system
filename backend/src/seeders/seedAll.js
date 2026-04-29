const { sequelize } = require('../models');
const seedUsers = require('./seedUsers');
const seedExamsFromExcel = require('./seedExamsFromExcel');
const { createExamExcelFiles } = require('../services/seedService/seed.service');

const seedAll = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    createExamExcelFiles();
    await seedUsers();
    await seedExamsFromExcel();

    console.log('All seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAll();
