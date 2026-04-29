const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Result = sequelize.define(
  'Result',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    total_score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    final_score: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'results',
    underscored: true,
    timestamps: false
  }
);

module.exports = Result;
