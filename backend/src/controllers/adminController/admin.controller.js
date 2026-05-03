const asyncHandler = require('../../utils/asyncHandler');
const { Op } = require('sequelize');
const { sequelize, User, Exam, Question, Assignment, Answer, Result } = require('../../models');
const { readExamBuffer } = require('../../services/excelService/excel.service');
const { PUBLIC_USER_ATTRIBUTES, USER_ROLES, USER_STATUSES, sanitizeUser } = require('../../utils/auth');

const userOrder = [
  ['status', 'ASC'],
  ['role', 'ASC'],
  ['id', 'ASC']
];

const allowedDifficulties = ['EASY', 'MEDIUM', 'HARD'];

function getRequiredValue(body, fieldName) {
  return String(body[fieldName] || '').trim();
}

function normalizeDifficulty(value) {
  const difficulty = String(value || '').trim().toUpperCase();
  return allowedDifficulties.includes(difficulty) ? difficulty : null;
}

function normalizeQuestions(questions) {
  if (Array.isArray(questions)) {
    return questions.map((question) => String(question || '').trim()).filter(Boolean);
  }

  if (typeof questions === 'string') {
    return questions
      .split('\n')
      .map((question) => question.trim())
      .filter(Boolean);
  }

  return [];
}

function getExcelCell(row, names) {
  const key = Object.keys(row).find((columnName) => names.includes(columnName.trim().toLowerCase()));
  return key ? row[key] : undefined;
}

function parseExamRows(rows) {
  if (!rows.length) {
    const error = new Error('Excel file does not contain exam rows');
    error.statusCode = 400;
    throw error;
  }

  const firstRow = rows[0];
  const title = String(getExcelCell(firstRow, ['title', 'exam title']) || '').trim();
  const difficulty = normalizeDifficulty(getExcelCell(firstRow, ['difficulty']));
  const questions = rows
    .map((row) => String(getExcelCell(row, ['question_text', 'question text', 'question']) || '').trim())
    .filter(Boolean);

  return { title, difficulty, questions };
}

function validateExamInput({ title, difficulty, questions }) {
  if (!title) {
    return 'Exam title is required';
  }

  if (!difficulty) {
    return 'Difficulty must be EASY, MEDIUM, or HARD';
  }

  if (!questions.length) {
    return 'At least one question is required';
  }

  return '';
}

async function createExamWithQuestions({ title, difficulty, questions, createdBy }) {
  return sequelize.transaction(async (transaction) => {
    const exam = await Exam.create(
      {
        title,
        difficulty,
        questions_count: questions.length,
        created_by: createdBy
      },
      { transaction }
    );

    await Question.bulkCreate(
      questions.map((questionText) => ({
        exam_id: exam.id,
        question_text: questionText
      })),
      { transaction }
    );

    return Exam.findByPk(exam.id, {
      include: [{ model: Question, as: 'questions', attributes: ['id', 'question_text'] }],
      transaction
    });
  });
}

async function deleteAssignments(assignmentIds, transaction) {
  if (!assignmentIds.length) {
    return;
  }

  await Answer.destroy({ where: { assignment_id: assignmentIds }, transaction });
  await Result.destroy({ where: { assignment_id: assignmentIds }, transaction });
  await Assignment.destroy({ where: { id: assignmentIds }, transaction });
}

async function deleteExamRecords(examId, transaction) {
  const assignments = await Assignment.findAll({
    where: { exam_id: examId },
    attributes: ['id'],
    transaction
  });
  const assignmentIds = assignments.map((assignment) => assignment.id);

  await deleteAssignments(assignmentIds, transaction);
  await Question.destroy({ where: { exam_id: examId }, transaction });
  await Exam.destroy({ where: { id: examId }, transaction });
}

const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: {
      status: USER_STATUSES.PENDING,
      role: [USER_ROLES.HR, USER_ROLES.EMPLOYEE]
    },
    attributes: PUBLIC_USER_ATTRIBUTES,
    order: userOrder
  });

  res.json(users.map(sanitizeUser));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: PUBLIC_USER_ATTRIBUTES,
    order: userOrder
  });

  res.json(users.map(sanitizeUser));
});

const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.findAll({
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] },
      { model: Question, as: 'questions', attributes: ['id', 'question_text'] }
    ],
    order: [['id', 'ASC']]
  });

  res.json(exams);
});

const createExam = asyncHandler(async (req, res) => {
  const title = getRequiredValue(req.body, 'title');
  const difficulty = normalizeDifficulty(req.body.difficulty);
  const questions = normalizeQuestions(req.body.questions);
  const validationError = validateExamInput({ title, difficulty, questions });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const exam = await createExamWithQuestions({
    title,
    difficulty,
    questions,
    createdBy: req.user.id
  });

  res.status(201).json({
    message: 'Exam created successfully',
    exam
  });
});

const uploadExamExcel = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ message: 'Excel file is required' });
  }

  const rows = readExamBuffer(req.file.buffer);
  const examData = parseExamRows(rows);
  const validationError = validateExamInput(examData);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const exam = await createExamWithQuestions({
    ...examData,
    createdBy: req.user.id
  });

  res.status(201).json({
    message: 'Exam uploaded successfully',
    exam
  });
});

const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.examId);

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  await sequelize.transaction(async (transaction) => {
    await deleteExamRecords(exam.id, transaction);
  });

  res.json({ message: 'Exam removed successfully' });
});

const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === USER_ROLES.ADMIN) {
    return res.status(400).json({ message: 'Admin accounts do not need approval' });
  }

  await user.update({ status: USER_STATUSES.APPROVED });

  res.json({
    message: 'User approved successfully',
    user: sanitizeUser(user)
  });
});

const rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === USER_ROLES.ADMIN) {
    return res.status(400).json({ message: 'Admin accounts cannot be rejected' });
  }

  await user.update({
    status: USER_STATUSES.REJECTED,
    otp_hash: null,
    otp_expires_at: null
  });

  res.json({
    message: 'User rejected successfully',
    user: sanitizeUser(user)
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (Number(user.id) === Number(req.user.id)) {
    return res.status(400).json({ message: 'You cannot remove your own admin account' });
  }

  await sequelize.transaction(async (transaction) => {
    const createdExams = await Exam.findAll({
      where: { created_by: user.id },
      attributes: ['id'],
      transaction
    });

    for (const exam of createdExams) {
      await deleteExamRecords(exam.id, transaction);
    }

    const assignments = await Assignment.findAll({
      where: {
        [Op.or]: [{ employee_id: user.id }, { assigned_by: user.id }]
      },
      attributes: ['id'],
      transaction
    });
    const assignmentIds = assignments.map((assignment) => assignment.id);

    await deleteAssignments(assignmentIds, transaction);
    await user.destroy({ transaction });
  });

  res.json({ message: 'User removed successfully' });
});

module.exports = {
  getPendingUsers,
  getUsers,
  getExams,
  createExam,
  uploadExamExcel,
  deleteExam,
  approveUser,
  rejectUser,
  deleteUser
};
