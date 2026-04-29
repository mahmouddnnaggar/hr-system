const express = require('express');
const employeeController = require('../../controllers/employeeController/employee.controller');
const upload = require('../../middlewares/upload/upload.middleware');

const router = express.Router();

router.get('/:employeeId/exams', employeeController.getEmployeeExams);
router.get('/assignment/:assignmentId/start', employeeController.startAssignment);
router.post('/submit-answer', upload.single('image'), employeeController.submitAnswer);
router.post('/finish-exam', employeeController.finishExam);
router.get('/:employeeId/results', employeeController.getEmployeeResults);

module.exports = router;
