const express = require('express');
const router = express.Router();
const { chat, getRecommendations, executeAssignment } = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with Yegna AI Assistant
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 *       400:
 *         description: Message is required
 */
router.post('/chat', authenticate, chat);

// New Admin-only AI routes
router.get('/recommendations', authenticate, authorize('SUPER_ADMIN', 'SUB_ADMIN'), getRecommendations);
router.post('/execute-assignment', authenticate, authorize('SUPER_ADMIN', 'SUB_ADMIN'), executeAssignment);

module.exports = router;
