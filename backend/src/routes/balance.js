const express = require("express");
const router = express.Router();
const {
  getBalance,
} = require("../controllers/balanceController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getBalance);

module.exports = router;
