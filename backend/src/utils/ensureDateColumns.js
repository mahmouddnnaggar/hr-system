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

const optionalDeletedAtColumn = {
  type: DataTypes.DATE,
  allowNull: true
};

const optionalDeletedByColumn = {
  type: DataTypes.INTEGER,
  allowNull: true
};

const optionalStringColumn = {
  type: DataTypes.STRING,
  allowNull: true
};

const optionalDateColumn = {
  type: DataTypes.DATE,
  allowNull: true
};

async function describeTable(queryInterface, tableName) {
  try {
    return await queryInterface.describeTable(tableName);
  } catch (error) {
    if (/doesn't exist|Unknown table|No description found/i.test(error.message)) {
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

async function dropColumnIfExists(queryInterface, tableName, columnName) {
  const table = await describeTable(queryInterface, tableName);

  if (!table?.[columnName]) {
    return;
  }

  await queryInterface.removeColumn(tableName, columnName);
}

async function ensureAuditLogsTable(queryInterface) {
  const table = await describeTable(queryInterface, 'audit_logs');

  if (table) {
    return;
  }

  await queryInterface.createTable('audit_logs', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: currentTimestampColumn
  });
}

async function ensureDateColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  await ensureAuditLogsTable(queryInterface);
  await ensureColumn(queryInterface, 'assignments', 'assigned_at', currentTimestampColumn);
  await ensureColumn(queryInterface, 'results', 'completed_at', currentTimestampColumn);
  await ensureNullableColumn(queryInterface, 'answers', 'image_url', optionalImageUrlColumn);
  await ensureChangedColumn(queryInterface, 'users', 'role', userRoleColumn);
  await ensureColumn(queryInterface, 'users', 'password_hash', userPasswordHashColumn);
  await ensureColumn(queryInterface, 'users', 'status', userStatusMigrationColumn);
  await dropColumnIfExists(queryInterface, 'users', 'is_email_verified');
  await dropColumnIfExists(queryInterface, 'users', 'otp_hash');
  await dropColumnIfExists(queryInterface, 'users', 'otp_expires_at');
  await ensureColumn(queryInterface, 'users', 'deleted_at', optionalDeletedAtColumn);
  await ensureColumn(queryInterface, 'users', 'deleted_by', optionalDeletedByColumn);
  await ensureColumn(queryInterface, 'users', 'refresh_token_hash', optionalStringColumn);
  await ensureColumn(queryInterface, 'users', 'reset_otp_hash', optionalStringColumn);
  await ensureColumn(queryInterface, 'users', 'reset_otp_expires_at', optionalDateColumn);
  await ensureColumn(queryInterface, 'exams', 'deleted_at', optionalDeletedAtColumn);
  await ensureColumn(queryInterface, 'exams', 'deleted_by', optionalDeletedByColumn);
}

module.exports = ensureDateColumns;
