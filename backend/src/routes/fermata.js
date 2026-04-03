const express = require("express");
const router = express.Router();
const {
  getAllFermatas,
  createFermata,
  updateFermata,
  deleteFermata,
} = require("../controllers/fermataController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, getAllFermatas);
router.post("/", authenticate, authorize("SUPER_ADMIN"), createFermata);
router.put("/:id", authenticate, authorize("SUPER_ADMIN"), updateFermata);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), deleteFermata);

module.exports = router;
