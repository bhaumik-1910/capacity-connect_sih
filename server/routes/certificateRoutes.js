const express = require('express');
const router = express.Router();
const {
  claimCertificate,
  getMyCertificates,
  verifyCertificatePublic,
  revokeCertificate,
  getAllCertificates,
  getTrainerCertificates,
  getGovernmentCertificateTemplate,
  updateGovernmentCertificateTemplate
} = require('../controllers/certificateController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public verification endpoint
router.get('/verify/:certificateNumber', verifyCertificatePublic);

// Government National Certificate Template (Studio for Direct/Open External Learners)
router.get('/government-template', getGovernmentCertificateTemplate);
router.put('/government-template', protect, authorizeRoles('admin', 'platform_admin', 'platform_super_admin'), updateGovernmentCertificateTemplate);

// Trainee endpoints
router.post('/claim/:courseId', protect, authorizeRoles('trainee', 'admin'), claimCertificate);
router.get('/my-certificates', protect, authorizeRoles('trainee', 'admin'), getMyCertificates);

// Trainer endpoints
router.get('/trainer/my-course-certs', protect, authorizeRoles('trainer', 'admin'), getTrainerCertificates);

// Admin endpoints
router.get('/admin/all', protect, authorizeRoles('admin', 'platform_admin'), getAllCertificates);
router.put('/:id/revoke', protect, authorizeRoles('admin', 'platform_admin'), revokeCertificate);

module.exports = router;
