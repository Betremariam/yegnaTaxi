const express = require('express');
const router = express.Router();
const {
  getDriverPayments,
  downloadDriverPaymentsExcel,
  updateDriverPayments,
  getAnalytics,
  registerSubAdmin,
  getSubAdmins,
  deleteSubAdmin,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Super Admin only routes
router.get('/drivers/payments', authenticate, authorize('SUPER_ADMIN'), getDriverPayments);
router.get('/drivers/payments/download', authenticate, authorize('SUPER_ADMIN'), downloadDriverPaymentsExcel);
router.put('/drivers/payments', authenticate, authorize('SUPER_ADMIN'), updateDriverPayments);

router.get('/analytics', authenticate, authorize('SUPER_ADMIN', 'SUB_ADMIN'), getAnalytics);

// Sub Admin Management (Super Admin only)
router.post('/sub-admins', authenticate, authorize('SUPER_ADMIN'), registerSubAdmin);
router.get('/sub-admins', authenticate, authorize('SUPER_ADMIN'), getSubAdmins);
router.delete('/sub-admins/:id', authenticate, authorize('SUPER_ADMIN'), deleteSubAdmin);

module.exports = router;

