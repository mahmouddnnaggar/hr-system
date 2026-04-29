const { DataTypes, Sequelize } = require('sequelize');

const currentTimestampColumn = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
};

async function ensureColumn(queryInterface, tableName, columnName, definition) {
  let table;

  try {
    table = await queryInterface.describeTable(tableName);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && /doesn't exist|Unknown table/i.test(error.message)) {
      return;
    }

    throw error;
  }

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

async function ensureDateColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  await ensureColumn(queryInterface, 'assignments', 'assigned_at', currentTimestampColumn);
  await ensureColumn(queryInterface, 'results', 'completed_at', currentTimestampColumn);
}

module.exports = ensureDateColumns;
