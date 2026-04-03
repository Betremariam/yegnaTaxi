const express = require("express");
const router = express.Router();
const {
  manualTopUp,
  processFarePayment,
  getTransactionHistory,
  processRefund,
} = require("../controllers/transactionController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  farePaymentValidation,
} = require("../utils/validators");

router.post(
  "/manual-top-up",
  authenticate,
  authorize("SUB_ADMIN", "SUPER_ADMIN"),
  manualTopUp
);

router.post(
  "/fare-payment",
  authenticate,
  authorize("DRIVER"),
  farePaymentValidation,
  processFarePayment
);

router.post(
  "/refund",
  authenticate,
  authorize("DRIVER"),
  farePaymentValidation,
  processRefund
);

router.get("/history", authenticate, getTransactionHistory);

module.exports = router;
