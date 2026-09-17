const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createInstituteSubscriptionOrder,
  createCourseEnrollmentOrder,
  verifyPayment,
  getInstituteSubscriptionStatus,
  getMyTransactions
} = require('../controllers/paymentController');

// Institutional Subscription Routes (B2B Quota: 1,000+ Students)
router.post('/institute/create-subscription', protect, authorizeRoles('institute_admin', 'org_admin', 'platform_admin'), createInstituteSubscriptionOrder);
router.get('/institute/subscription', protect, authorizeRoles('institute_admin', 'org_admin', 'platform_admin'), getInstituteSubscriptionStatus);

// Individual Trainee Course Checkout Routes (B2C)
router.post('/course/create-order', protect, createCourseEnrollmentOrder);

// Verification & Ledger
router.post('/verify', protect, verifyPayment);
router.get('/my-transactions', protect, getMyTransactions);

module.exports = router;
