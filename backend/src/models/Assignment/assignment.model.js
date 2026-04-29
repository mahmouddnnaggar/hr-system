const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Assignment = sequelize.define(
  'Assignment',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  },
  {
    tableName: 'assignments',
    underscored: true,
    timestamps: false
  }
);

module.exports = Assignment;
