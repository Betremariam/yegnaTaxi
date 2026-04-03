const express = require("express");
const router = express.Router();
const {
  login,
  changePassword,
  getProfile,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const {
  loginValidation,
  changePasswordValidation,
} = require("../utils/validators");

router.post("/login", loginValidation, login);
router.post(
  "/change-password",
  authenticate,
  changePasswordValidation,
  changePassword
);
router.get("/profile", authenticate, getProfile);

module.exports = router;
