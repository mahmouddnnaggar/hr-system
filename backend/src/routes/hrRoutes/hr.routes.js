const express = require('express');
const hrController = require('../../controllers/hrController/hr.controller');
const { authenticate, authorizeRoles } = require('../../middlewares/auth/auth.middleware');
const { USER_ROLES } = require('../../utils/auth');

const router = express.Router();

router.use(authenticate, authorizeRoles(USER_ROLES.HR));

router.get('/employees', hrController.getEmployees);
router.get('/exams', hrController.getExams);
router.post('/assign-exam', hrController.assignExam);
router.get('/assignments', hrController.getAssignments);
router.delete('/assignments/:assignmentId', hrController.unassignExam);
router.get('/results', hrController.getResults);
router.get('/results/:employeeId', hrController.getResultsByEmployee);

module.exports = router;
