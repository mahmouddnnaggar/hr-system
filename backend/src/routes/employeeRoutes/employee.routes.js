const express = require('express');
const employeeController = require('../../controllers/employeeController/employee.controller');
const { authenticate, authorizeRoles, requireSameEmployee } = require('../../middlewares/auth/auth.middleware');
const { USER_ROLES } = require('../../utils/auth');
const upload = require('../../middlewares/upload/upload.middleware');

const router = express.Router();

router.use(authenticate, authorizeRoles(USER_ROLES.EMPLOYEE));

router.get('/:employeeId/exams', requireSameEmployee, employeeController.getEmployeeExams);
router.get('/assignment/:assignmentId/start', employeeController.startAssignment);
router.post('/submit-answer', upload.single('image'), employeeController.submitAnswer);
router.post('/finish-exam', employeeController.finishExam);
router.get('/:employeeId/results', requireSameEmployee, employeeController.getEmployeeResults);

module.exports = router;
