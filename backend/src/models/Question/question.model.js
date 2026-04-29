const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Question = sequelize.define(
  'Question',
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
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'questions',
    underscored: true,
    timestamps: false
  }
);

module.exports = Question;
