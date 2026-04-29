const sequelize = require('../config/db');

const User = require('./User/user.model');
const Exam = require('./Exam/exam.model');
const Question = require('./Question/question.model');
const Assignment = require('./Assignment/assignment.model');
const Answer = require('./Answer/answer.model');
const Result = require('./Result/result.model');

User.hasMany(Exam, { foreignKey: 'created_by', as: 'createdExams' });
Exam.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Exam.hasMany(Question, { foreignKey: 'exam_id', as: 'questions' });
Question.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

Exam.hasMany(Assignment, { foreignKey: 'exam_id', as: 'assignments' });
Assignment.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

Assignment.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Assignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedBy' });

Assignment.hasMany(Answer, { foreignKey: 'assignment_id', as: 'answers' });
Answer.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });

Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });

Assignment.hasOne(Result, { foreignKey: 'assignment_id', as: 'result' });
Result.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });

module.exports = {
  sequelize,
  User,
  Exam,
  Question,
  Assignment,
  Answer,
  Result
};
