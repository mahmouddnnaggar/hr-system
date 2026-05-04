const express = require('express');
const adminController = require('../../controllers/adminController/admin.controller');
const { authenticate, authorizeRoles } = require('../../middlewares/auth/auth.middleware');
const excelUpload = require('../../middlewares/upload/excelUpload.middleware');
const { USER_ROLES } = require('../../utils/auth');

const router = express.Router();

router.use(authenticate, authorizeRoles(USER_ROLES.ADMIN));

router.get('/pending-users', adminController.getPendingUsers);
router.get('/users', adminController.getUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.patch('/users/:userId/approve', adminController.approveUser);
router.patch('/users/:userId/reject', adminController.rejectUser);
router.get('/exams', adminController.getExams);
router.post('/exams', adminController.createExam);
router.post('/exams/upload-excel', excelUpload.single('file'), adminController.uploadExamExcel);
router.delete('/exams/:examId', adminController.deleteExam);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/analytics', adminController.getAnalytics);
router.get('/reports/users', adminController.exportUsers);
router.get('/reports/exams', adminController.exportExams);
router.get('/reports/results', adminController.exportResults);

module.exports = router;
