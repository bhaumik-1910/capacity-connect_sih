const express = require('express');
const router = express.Router();
const {
  getCompetencies,
  createCompetency,
  getMySkillGap,
  getTargetRoles,
  deleteCompetency
} = require('../controllers/competencyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getCompetencies);
router.get('/target-roles', getTargetRoles);
router.get('/skill-gap', protect, getMySkillGap);
router.post('/', protect, authorizeRoles('admin', 'platform_admin'), createCompetency);
router.delete('/:id', protect, authorizeRoles('admin', 'platform_admin'), deleteCompetency);

module.exports = router;
