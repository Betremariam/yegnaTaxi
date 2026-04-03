const { getChatResponse, getTrafficAnalytics, getAdminRecommendations } = require('../services/aiService');
const prisma = require('../config/database');

/**
 * Handle AI Chat Request
 */
const chat = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        const aiResponse = await getChatResponse(message, history || []);

        res.json({
            success: true,
            data: {
                response: aiResponse,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get AI Traffic Recommendations for Admin
 */
const getRecommendations = async (req, res, next) => {
    try {
        const trafficData = await getTrafficAnalytics(prisma);
        const recommendations = await getAdminRecommendations(trafficData);

        res.json({
            success: true,
            data: {
                trafficData,
                recommendations
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin executes an AI-recommended assignment
 */
const executeAssignment = async (req, res, next) => {
    try {
        const { driverId, fermataId } = req.body;

        if (!driverId || !fermataId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID and Fermata ID are required'
            });
        }

        // Add the new fermata to the driver's allowed list (if not already there)
        await prisma.user.update({
            where: { id: driverId },
            data: {
                fermatas: {
                    connect: { id: fermataId }
                }
            }
        });

        res.json({
            success: true,
            message: 'Driver successfully assigned to the new station'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    chat,
    getRecommendations,
    executeAssignment
};
