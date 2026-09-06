const express = require('express');
const router = express.Router();
const { getSessions, createSession, markAttendance } = require('../controllers/sessionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getSessions);
router.post('/', protect, authorizeRoles('trainer', 'admin', 'institute_admin', 'org_admin'), createSession);
router.put('/:id/attendance', protect, authorizeRoles('trainer', 'admin', 'institute_admin', 'org_admin'), markAttendance);

module.exports = router;
