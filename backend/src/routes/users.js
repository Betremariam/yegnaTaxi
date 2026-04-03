const express = require("express");
const router = express.Router();
const {
  registerDriver,
  registerPassengerByAdmin,
  getAllUsers,
  getUserById,
  getPassengerByNationalId,
  updateUser,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

// Sub Admin & Super Admin routes
router.post(
  "/register-driver",
  authenticate,
  authorize("SUB_ADMIN", "SUPER_ADMIN"),
  registerDriver
);

router.post(
  "/register-passenger",
  authenticate,
  authorize("SUB_ADMIN", "SUPER_ADMIN"),
  registerPassengerByAdmin
);

router.get(
  "/",
  authenticate,
  authorize("SUB_ADMIN", "SUPER_ADMIN"),
  getAllUsers
);

router.get(
  "/:id",
  authenticate,
  authorize("SUB_ADMIN", "SUPER_ADMIN"),
  getUserById
);

router.put(
  "/:id",
  authenticate,
  authorize("SUB_ADMIN", "SUPER_ADMIN"),
  updateUser
);

// Driver routes
router.post(
  "/lookup-passenger",
  authenticate,
  authorize("DRIVER"),
  getPassengerByNationalId
);

module.exports = router;
