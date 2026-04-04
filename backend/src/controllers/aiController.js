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
        console.error("Controller AI Recommendations Error:", error.message);
        // If it's a rate limit error but we don't have cache, send a 200 with a warning instead of 500
        if (error.message.includes('429')) {
            return res.json({
                success: true,
                data: {
                    trafficData: [],
                    recommendations: "The AI is currently busy. Please try again in a few minutes.",
                    isRateLimited: true
                }
            });
        }
        next(error);
    }
};

/**
 * Get AI Predictive Forecast for Admin
 */
const getForecast = async (req, res, next) => {
    try {
        const { getDemandForecast } = require('../services/aiService');
        const forecastData = await getDemandForecast(prisma);

        res.json({
            success: true,
            data: forecastData
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

        // REASSIGN the driver to the new station (Clearing previous assignments)
        await prisma.user.update({
            where: { id: driverId },
            data: {
                fermatas: {
                    set: [{ id: fermataId }]
                }
            }
        });

        res.json({
            success: true,
            message: 'Driver successfully reassigned to the new station'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    chat,
    getRecommendations,
    getForecast,
    executeAssignment
};
