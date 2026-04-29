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

async function ensureDateColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  await ensureColumn(queryInterface, 'assignments', 'assigned_at', currentTimestampColumn);
  await ensureColumn(queryInterface, 'results', 'completed_at', currentTimestampColumn);
  await ensureNullableColumn(queryInterface, 'answers', 'image_url', optionalImageUrlColumn);
}

module.exports = ensureDateColumns;
