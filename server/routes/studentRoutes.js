const express = require('express');
const router = express.Router();
const {
  bulkImportStudents,
  createSingleStudent,
  getStudentsList,
  getStudentExamSubmissions,
  deleteStudent
} = require('../controllers/studentOnboardingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Accessible by Admin, Institute Admin, and Trainer roles
router.use(protect, authorizeRoles('admin', 'platform_admin', 'institute_admin', 'org_admin', 'trainer'));

router.post('/bulk-import', bulkImportStudents);
router.post('/single', createSingleStudent);
router.get('/', getStudentsList);
router.get('/exam-submissions', getStudentExamSubmissions);
router.delete('/:id', deleteStudent);

module.exports = router;
