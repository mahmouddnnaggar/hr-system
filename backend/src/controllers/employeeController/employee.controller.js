const asyncHandler = require('../../utils/asyncHandler');
const { sequelize, User, Exam, Question, Assignment, Answer, Result } = require('../../models');
const { calculateAnswerScore, calculateFinalScore, scoreMap } = require('../../utils/calculateScore');

const getEmployeeExams = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const assignments = await Assignment.findAll({
    where: { employee_id: employeeId },
    include: [
      { model: Exam, as: 'exam', attributes: ['id', 'title', 'difficulty', 'questions_count'] },
      { model: User, as: 'assignedBy', attributes: ['id', 'name', 'email'] }
    ],
    order: [['id', 'DESC']]
  });

  res.json(assignments);
});

const startAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findByPk(assignmentId, {
    include: [
      {
        model: Exam,
        as: 'exam',
        include: [{ model: Question, as: 'questions', attributes: ['id', 'question_text'] }]
      },
      { model: Answer, as: 'answers' }
    ]
  });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  res.json(assignment);
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { assignment_id, question_id, selected_answer } = req.body;

  if (!assignment_id || !question_id || !selected_answer) {
    return res.status(400).json({ message: 'assignment_id, question_id, and selected_answer are required' });
  }

  if (!Object.prototype.hasOwnProperty.call(scoreMap, selected_answer)) {
    return res.status(400).json({ message: 'selected_answer must be NO, PARTIAL, or YES' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image proof is required' });
  }

  const assignment = await Assignment.findByPk(assignment_id, {
    include: [{ model: Exam, as: 'exam' }]
  });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  if (assignment.status === 'COMPLETED') {
    return res.status(400).json({ message: 'This assignment is already completed' });
  }

  const question = await Question.findOne({
    where: {
      id: question_id,
      exam_id: assignment.exam_id
    }
  });

  if (!question) {
    return res.status(404).json({ message: 'Question not found for this assignment exam' });
  }

  const score = calculateAnswerScore(selected_answer);
  const imageUrl = `/uploads/${req.file.filename}`;

  const existingAnswer = await Answer.findOne({
    where: { assignment_id, question_id }
  });

  if (existingAnswer) {
    await existingAnswer.update({
      selected_answer,
      score,
      image_url: imageUrl
    });

    return res.json({
      message: 'Answer updated successfully',
      answer: existingAnswer
    });
  }

  const answer = await Answer.create({
    assignment_id,
    question_id,
    selected_answer,
    score,
    image_url: imageUrl
  });

  res.status(201).json({
    message: 'Answer submitted successfully',
    answer
  });
});

const finishExam = asyncHandler(async (req, res) => {
  const { assignment_id } = req.body;

  if (!assignment_id) {
    return res.status(400).json({ message: 'assignment_id is required' });
  }

  const assignment = await Assignment.findByPk(assignment_id, {
    include: [
      { model: Exam, as: 'exam', include: [{ model: Question, as: 'questions' }] },
      { model: Answer, as: 'answers' },
      { model: Result, as: 'result' }
    ]
  });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  if (assignment.result) {
    return res.status(400).json({ message: 'Result already exists for this assignment' });
  }

  const questionsCount = assignment.exam.questions.length;
  const answersCount = assignment.answers.length;

  if (answersCount !== questionsCount) {
    return res.status(400).json({
      message: `Please answer all questions before finishing. Answered ${answersCount} of ${questionsCount}.`
    });
  }

  const totalScore = assignment.answers.reduce((sum, answer) => sum + answer.score, 0);
  const finalScore = calculateFinalScore(totalScore, questionsCount);

  const result = await sequelize.transaction(async (transaction) => {
    const createdResult = await Result.create(
      {
        assignment_id,
        total_score: totalScore,
        final_score: finalScore
      },
      { transaction }
    );

    await assignment.update({ status: 'COMPLETED' }, { transaction });

    return createdResult;
  });

  res.status(201).json({
    message: 'Exam finished successfully',
    result
  });
});

const getEmployeeResults = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const results = await Result.findAll({
    include: [
      {
        model: Assignment,
        as: 'assignment',
        where: { employee_id: employeeId },
        include: [{ model: Exam, as: 'exam', attributes: ['id', 'title', 'difficulty', 'questions_count'] }]
      }
    ],
    order: [['id', 'DESC']]
  });

  res.json(results);
});

module.exports = {
  getEmployeeExams,
  startAssignment,
  submitAnswer,
  finishExam,
  getEmployeeResults
};
