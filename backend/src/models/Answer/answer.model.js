const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Answer = sequelize.define(
  'Answer',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    selected_answer: {
      type: DataTypes.ENUM('NO', 'PARTIAL', 'YES'),
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'answers',
    underscored: true,
    timestamps: false
  }
);

module.exports = Answer;
