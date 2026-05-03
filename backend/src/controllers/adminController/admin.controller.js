const asyncHandler = require('../../utils/asyncHandler');
const { Op } = require('sequelize');
const { sequelize, User, Exam, Question, AuditLog } = require('../../models');
const { readExamBuffer } = require('../../services/excelService/excel.service');
const logAudit = require('../../utils/auditLog');
const { PUBLIC_USER_ATTRIBUTES, USER_ROLES, USER_STATUSES, sanitizeUser } = require('../../utils/auth');
const { buildPaginatedResponse, getPagination } = require('../../utils/pagination');

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

function buildUserWhere(query) {
  const where = {};

  if (query.includeDeleted !== 'true') {
    where.deleted_at = null;
  }

  if (query.role) {
    where.role = String(query.role).trim().toUpperCase();
  }

  if (query.status) {
    where.status = String(query.status).trim().toUpperCase();
  }

  if (query.search) {
    const search = `%${String(query.search).trim()}%`;
    where[Op.or] = [{ name: { [Op.like]: search } }, { email: { [Op.like]: search } }];
  }

  return where;
}

function buildExamWhere(query) {
  const where = {};

  if (query.includeDeleted !== 'true') {
    where.deleted_at = null;
  }

  if (query.difficulty) {
    where.difficulty = String(query.difficulty).trim().toUpperCase();
  }

  if (query.search) {
    where.title = { [Op.like]: `%${String(query.search).trim()}%` };
  }

  return where;
}

function buildAuditWhere(query) {
  const where = {};

  if (query.action) {
    where.action = { [Op.like]: `%${String(query.action).trim()}%` };
  }

  if (query.entityType) {
    where.entity_type = String(query.entityType).trim();
  }

  if (query.search) {
    where.message = { [Op.like]: `%${String(query.search).trim()}%` };
  }

  return where;
}

const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: {
      status: USER_STATUSES.PENDING,
      role: [USER_ROLES.HR, USER_ROLES.EMPLOYEE],
      deleted_at: null
    },
    attributes: PUBLIC_USER_ATTRIBUTES,
    order: userOrder
  });

  res.json(users.map(sanitizeUser));
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, count } = await User.findAndCountAll({
    where: buildUserWhere(req.query),
    attributes: PUBLIC_USER_ATTRIBUTES,
    order: userOrder,
    limit,
    offset
  });

  res.json(
    buildPaginatedResponse({
      rows: rows.map(sanitizeUser),
      count,
      page,
      limit
    })
  );
});

const getExams = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, count } = await Exam.findAndCountAll({
    where: buildExamWhere(req.query),
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] },
      { model: Question, as: 'questions', attributes: ['id', 'question_text'] }
    ],
    distinct: true,
    order: [['id', 'ASC']],
    limit,
    offset
  });

  res.json(buildPaginatedResponse({ rows, count, page, limit }));
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, count } = await AuditLog.findAndCountAll({
    where: buildAuditWhere(req.query),
    include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email', 'role'] }],
    order: [['id', 'DESC']],
    limit,
    offset
  });

  res.json(buildPaginatedResponse({ rows, count, page, limit }));
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

  await logAudit({
    actorId: req.user.id,
    action: 'CREATE_EXAM',
    entityType: 'Exam',
    entityId: exam.id,
    message: `Created exam ${exam.title}`
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

  await logAudit({
    actorId: req.user.id,
    action: 'UPLOAD_EXAM_EXCEL',
    entityType: 'Exam',
    entityId: exam.id,
    message: `Uploaded exam ${exam.title} from Excel`
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

  if (exam.deleted_at) {
    return res.status(400).json({ message: 'Exam is already removed' });
  }

  await sequelize.transaction(async (transaction) => {
    await exam.update({ deleted_at: new Date(), deleted_by: req.user.id }, { transaction });
    await logAudit({
      actorId: req.user.id,
      action: 'DELETE_EXAM',
      entityType: 'Exam',
      entityId: exam.id,
      message: `Soft deleted exam ${exam.title}`,
      transaction
    });
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
  await logAudit({
    actorId: req.user.id,
    action: 'APPROVE_USER',
    entityType: 'User',
    entityId: user.id,
    message: `Approved user ${user.email}`
  });

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

  await user.update({ status: USER_STATUSES.REJECTED });
  await logAudit({
    actorId: req.user.id,
    action: 'REJECT_USER',
    entityType: 'User',
    entityId: user.id,
    message: `Rejected user ${user.email}`
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

  if (user.deleted_at) {
    return res.status(400).json({ message: 'User is already removed' });
  }

  await sequelize.transaction(async (transaction) => {
    await user.update(
      {
        status: USER_STATUSES.REJECTED,
        deleted_at: new Date(),
        deleted_by: req.user.id
      },
      { transaction }
    );

    await Exam.update(
      {
        deleted_at: new Date(),
        deleted_by: req.user.id
      },
      {
        where: {
          created_by: user.id,
          deleted_at: null
        },
        transaction
      }
    );

    await logAudit({
      actorId: req.user.id,
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: user.id,
      message: `Soft deleted user ${user.email}`,
      transaction
    });
  });

  res.json({ message: 'User removed successfully' });
});

module.exports = {
  getPendingUsers,
  getUsers,
  getExams,
  getAuditLogs,
  createExam,
  uploadExamExcel,
  deleteExam,
  approveUser,
  rejectUser,
  deleteUser
};
