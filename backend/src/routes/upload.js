const express = require('express');
const router = express.Router();
const { handleUpload } = require('../controllers/uploadController');

// POST /api/upload/profile-picture - Upload profile picture (no authentication required)
router.post('/profile-picture', handleUpload);

module.exports = router;