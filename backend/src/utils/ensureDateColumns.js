const { DataTypes, Sequelize } = require('sequelize');

const currentTimestampColumn = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
};

const optionalImageUrlColumn = {
  type: DataTypes.STRING,
  allowNull: true
};

const userRoleColumn = {
  type: DataTypes.ENUM('ADMIN', 'HR', 'EMPLOYEE'),
  allowNull: false
};

const userPasswordHashColumn = {
  type: DataTypes.STRING,
  allowNull: true
};

const userStatusMigrationColumn = {
  type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
  allowNull: false,
  defaultValue: 'APPROVED'
};

const userEmailVerifiedMigrationColumn = {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true
};

const userOtpHashColumn = {
  type: DataTypes.STRING,
  allowNull: true
};

const userOtpExpiresAtColumn = {
  type: DataTypes.DATE,
  allowNull: true
};

async function describeTable(queryInterface, tableName) {
  try {
    return await queryInterface.describeTable(tableName);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && /doesn't exist|Unknown table/i.test(error.message)) {
      return null;
    }

    throw error;
  }
}

async function ensureColumn(queryInterface, tableName, columnName, definition) {
  const table = await describeTable(queryInterface, tableName);

  if (!table) {
    return;
  }

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

async function ensureNullableColumn(queryInterface, tableName, columnName, definition) {
  const table = await describeTable(queryInterface, tableName);

  if (!table) {
    return;
  }

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
    return;
  }

  if (table[columnName].allowNull === false) {
    await queryInterface.changeColumn(tableName, columnName, definition);
  }
}

async function ensureChangedColumn(queryInterface, tableName, columnName, definition) {
  const table = await describeTable(queryInterface, tableName);

  if (!table) {
    return;
  }

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
    return;
  }

  await queryInterface.changeColumn(tableName, columnName, definition);
}

async function ensureDateColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  await ensureColumn(queryInterface, 'assignments', 'assigned_at', currentTimestampColumn);
  await ensureColumn(queryInterface, 'results', 'completed_at', currentTimestampColumn);
  await ensureNullableColumn(queryInterface, 'answers', 'image_url', optionalImageUrlColumn);
  await ensureChangedColumn(queryInterface, 'users', 'role', userRoleColumn);
  await ensureColumn(queryInterface, 'users', 'password_hash', userPasswordHashColumn);
  await ensureColumn(queryInterface, 'users', 'status', userStatusMigrationColumn);
  await ensureColumn(queryInterface, 'users', 'is_email_verified', userEmailVerifiedMigrationColumn);
  await ensureColumn(queryInterface, 'users', 'otp_hash', userOtpHashColumn);
  await ensureColumn(queryInterface, 'users', 'otp_expires_at', userOtpExpiresAtColumn);
}

module.exports = ensureDateColumns;
