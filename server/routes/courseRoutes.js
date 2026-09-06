const express = require('express');
const router = express.Router();
const {
  getPublishedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTrainerCourses,
  enrollCourse,
  updateModuleProgress,
  getMyEnrollments,
  getTraineeAnalytics,
  updateCourseCertTemplate,
  getCourseEnrollments
} = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public / Learner catalogue browsing
router.get('/', getPublishedCourses);
router.get('/trainee/my-enrollments', protect, authorizeRoles('trainee', 'student', 'trainer', 'institute_admin', 'org_admin', 'admin'), getMyEnrollments);
router.get('/trainer/my-courses', protect, authorizeRoles('trainer', 'admin', 'institute_admin', 'org_admin'), getTrainerCourses);
router.get('/trainer/trainee-analytics', protect, authorizeRoles('trainer', 'admin', 'institute_admin', 'org_admin'), getTraineeAnalytics);
router.get('/:id/enrollments', protect, authorizeRoles('trainer', 'admin', 'institute_admin', 'org_admin'), getCourseEnrollments);
router.get('/:id', getCourseById);

// Protected actions
router.post('/', protect, authorizeRoles('trainer', 'admin'), createCourse);
router.put('/:id/certificate-template', protect, authorizeRoles('trainer', 'admin'), updateCourseCertTemplate);
router.put('/:id', protect, authorizeRoles('trainer', 'admin'), updateCourse);
router.delete('/:id', protect, authorizeRoles('trainer', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorizeRoles('trainee', 'student', 'admin'), enrollCourse);
router.post('/:id/progress', protect, authorizeRoles('trainee', 'student', 'admin'), updateModuleProgress);

module.exports = router;
