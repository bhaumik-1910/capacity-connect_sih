const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  deleteUser,
  getUserLearningProgress,
  updateCourseGovernanceStatus,
  getAuditLogs,
  clearAuditLogs,
  deleteAuditLog,
  getAnnouncements,
  createAnnouncement,
  getPublicStats
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/announcements', getAnnouncements);
router.get('/public-stats', getPublicStats);

// Trainee / Learner comprehensive progress dossier (Admin, Institute Admin & Trainer accessible)
router.get('/users/:id/progress', protect, authorizeRoles('admin', 'platform_admin', 'institute_admin', 'trainer'), getUserLearningProgress);

// User Directory (Accessible to Platform Admins and Institute Admins with scoped tenant isolation)
router.get('/users', protect, authorizeRoles('admin', 'platform_admin', 'institute_admin', 'org_admin'), getAllUsers);

// Audit Logs (Accessible to Platform Admins and Institute Admins with scoped tenant isolation)
router.get('/audit-logs', protect, authorizeRoles('admin', 'platform_admin', 'institute_admin', 'org_admin'), getAuditLogs);
router.delete('/audit-logs', protect, authorizeRoles('admin', 'platform_admin', 'institute_admin', 'org_admin'), clearAuditLogs);
router.delete('/audit-logs/:id', protect, authorizeRoles('admin', 'platform_admin', 'institute_admin', 'org_admin'), deleteAuditLog);

// Strict Platform Admin only routes
router.use(protect, authorizeRoles('admin', 'platform_admin'));

router.get('/dashboard-metrics', getDashboardMetrics);
router.get('/pending-users', getPendingUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.delete('/users/:id', deleteUser);
router.put('/courses/:id/status', updateCourseGovernanceStatus);
router.post('/announcements', createAnnouncement);

module.exports = router;
