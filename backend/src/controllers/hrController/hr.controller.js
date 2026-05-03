const asyncHandler = require('../../utils/asyncHandler');
const { sequelize, User, Exam, Question, Assignment, Answer, Result } = require('../../models');
const { USER_ROLES, USER_STATUSES } = require('../../utils/auth');

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.findAll({
    where: {
      role: USER_ROLES.EMPLOYEE,
      status: USER_STATUSES.APPROVED,
      is_email_verified: true
    },
    attributes: ['id', 'name', 'email', 'role', 'status', 'is_email_verified'],
    order: [['id', 'ASC']]
  });

  res.json(employees);
});

const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.findAll({
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: Question, as: 'questions', attributes: ['id', 'question_text'] }
    ],
    order: [['id', 'ASC']]
  });

  res.json(exams);
});

const assignExam = asyncHandler(async (req, res) => {
  const { exam_id, employee_id, assigned_by } = req.body;
  const assignedBy = req.user.id;

  if (!exam_id || !employee_id) {
    return res.status(400).json({ message: 'exam_id and employee_id are required' });
  }

  if (assigned_by && Number(assigned_by) !== Number(assignedBy)) {
    return res.status(403).json({ message: 'You can only assign exams as yourself' });
  }

  const exam = await Exam.findByPk(exam_id);
  const employee = await User.findOne({
    where: {
      id: employee_id,
      role: USER_ROLES.EMPLOYEE,
      status: USER_STATUSES.APPROVED,
      is_email_verified: true
    }
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (!employee) {
    return res.status(404).json({ message: 'Approved employee not found' });
  }

  const assignment = await Assignment.create({
    exam_id,
    employee_id,
    assigned_by: assignedBy,
    assigned_at: new Date(),
    status: 'PENDING'
  });

  res.status(201).json({
    message: 'Exam assigned successfully',
    assignment
  });
});

const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.findAll({
    include: [
      { model: Exam, as: 'exam', attributes: ['id', 'title', 'difficulty', 'questions_count'] },
      { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'assignedBy', attributes: ['id', 'name', 'email'] },
      { model: Result, as: 'result', attributes: ['id', 'final_score', 'completed_at'] }
    ],
    order: [
      ['assigned_at', 'DESC'],
      ['id', 'DESC']
    ]
  });

  res.json(assignments);
});

const unassignExam = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { assigned_by } = req.body;
  const assignedBy = req.user.id;

  if (assigned_by && Number(assigned_by) !== Number(assignedBy)) {
    return res.status(403).json({ message: 'You can only unassign exams as yourself' });
  }

  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: Result, as: 'result', attributes: ['id'] }]
  });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  if (Number(assignment.assigned_by) !== Number(assignedBy)) {
    return res.status(403).json({ message: 'Only the HR user who assigned this exam can unassign it' });
  }

  if (assignment.status === 'COMPLETED' || assignment.result) {
    return res.status(400).json({ message: 'Completed exams cannot be unassigned' });
  }

  await sequelize.transaction(async (transaction) => {
    await Answer.destroy({ where: { assignment_id: assignment.id }, transaction });
    await assignment.destroy({ transaction });
  });

  res.json({ message: 'Exam unassigned successfully' });
});

const getResults = asyncHandler(async (req, res) => {
  const results = await Result.findAll({
    include: [
      {
        model: Assignment,
        as: 'assignment',
        include: [
          { model: Exam, as: 'exam', attributes: ['id', 'title', 'difficulty', 'questions_count'] },
          { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignedBy', attributes: ['id', 'name', 'email'] }
        ]
      }
    ],
    order: [['id', 'DESC']]
  });

  res.json(results);
});

const getResultsByEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const results = await Result.findAll({
    include: [
      {
        model: Assignment,
        as: 'assignment',
        where: { employee_id: employeeId },
        include: [
          { model: Exam, as: 'exam', attributes: ['id', 'title', 'difficulty', 'questions_count'] },
          { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignedBy', attributes: ['id', 'name', 'email'] }
        ]
      }
    ],
    order: [['id', 'DESC']]
  });

  res.json(results);
});

module.exports = {
  getEmployees,
  getExams,
  assignExam,
  getAssignments,
  unassignExam,
  getResults,
  getResultsByEmployee
};
