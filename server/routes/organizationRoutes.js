const express = require('express');
const router = express.Router();
const {
  registerOrganization,
  getOrganizations,
  getAllOrganizationsForAdmin,
  getOrganizationVerificationDossier,
  reviewOrganization,
  approveOrganization,
  updateCertificateTemplate,
  getInstituteMetrics,
  getAcademicStructure,
  updateAcademicStructure,
  deleteOrganization
} = require('../controllers/organizationController');
const { protect, authorizeRoles, enforceTenantIsolation } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerOrganization);
router.get('/', getOrganizations);

// Institute Tenant scoped metrics & structure (Institute Admin or Platform Admin)
router.get('/institute/metrics', protect, authorizeRoles('institute_admin', 'org_admin', 'platform_admin'), getInstituteMetrics);
router.get('/:id/academic-structure', protect, authorizeRoles('institute_admin', 'org_admin', 'platform_admin'), getAcademicStructure);
router.put('/:id/academic-structure', protect, authorizeRoles('institute_admin', 'org_admin', 'platform_admin'), updateAcademicStructure);

// Template Builder (Institute Admin for their own org, or Platform Admin)
router.put('/:id/certificate-template', protect, authorizeRoles('institute_admin', 'org_admin', 'platform_admin'), updateCertificateTemplate);

// Platform Admin Governance endpoints ("Institute Check")
router.get('/admin/all', protect, authorizeRoles('admin', 'platform_admin'), getAllOrganizationsForAdmin);
router.get('/:id/verification-dossier', protect, authorizeRoles('admin', 'platform_admin'), getOrganizationVerificationDossier);
router.put('/:id/review', protect, authorizeRoles('admin', 'platform_admin'), reviewOrganization);
router.put('/:id/approve', protect, authorizeRoles('admin', 'platform_admin'), approveOrganization);
router.delete('/:id', protect, authorizeRoles('admin', 'platform_admin'), deleteOrganization);

module.exports = router;
