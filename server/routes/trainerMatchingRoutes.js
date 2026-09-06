const express = require('express');
const router = express.Router();
const { getTrainerMatches } = require('../controllers/trainerMatchingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/match', protect, authorizeRoles('admin', 'trainer'), getTrainerMatches);

module.exports = router;
