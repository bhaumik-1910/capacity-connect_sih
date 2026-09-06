const express = require('express');
const router = express.Router();
const {
  getCourseAssessment,
  submitAssessmentAttempt,
  getMyAttempts,
  createAssessment,
  getCourseSubmissions
} = require('../controllers/assessmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/course/:courseId', protect, getCourseAssessment);
router.get('/course/:courseId/submissions', protect, authorizeRoles('trainer', 'admin'), getCourseSubmissions);
router.post('/:id/submit', protect, submitAssessmentAttempt);
router.get('/my-attempts', protect, getMyAttempts);
router.post('/', protect, authorizeRoles('trainer', 'admin'), createAssessment);

module.exports = router;
