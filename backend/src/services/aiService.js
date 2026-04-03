const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
You are the Yegna AI Assistant, a helpful and professional AI guide for the YegnaTaxi platform.
YegnaTaxi is a QR-based digital payment system for shared transport in Ethiopia.

Platform Overview:
- Users: Passengers, Drivers, Agents, Sub-Admins, and Super-Admins.
- Core Mechanic: Passengers use QR codes for fare payments. Drivers scan passenger QRs.
- Agents: Handle passenger registration and top-ups. Agents earn a 3% commission on top-ups.
- Drivers: Collect fares via QR scans. Their earnings are paid out by Super Admin every 3 days.
- Non-smartphone users: Can get printed QR codes from agents (via sub-admins).
- Payments: Chapa is used for mobile deposits (agents topping up, passengers topping up).

Business Rules:
1. Passenger Top-up: Agent deposits → Passenger balance increases → Agent gets 3% commission.
2. Fare Payment: Driver scans QR → Enters fare → Passenger balance decreases → Driver earnings increase.
3. Payouts: Super Admin manual processing after Excel download.
4. QR distribution: Mobile app automatic for smartphone users; printed QRs from Agents for others.
5. Balance Management: Agents have Operating and Commission balances. Passengers have a single balance.

Your Goal:
- Provide accurate information about the platform.
- Help users troubleshoot common issues (e.g., "how to top up", "how to scan").
- Be concise, friendly, and professional.
- If you don't know the answer, advise the user to contact human support.
- Do NOT make up financial data or transaction statuses; you only have general platform knowledge.

Respond in English. If the user asks in Amharic, respond to the best of your ability (if supported) or politely ask for English.
`;

const getChatResponse = async (userMessage, history = []) => {
    try {
        // Some regions/keys might not have access to gemini-flash-latest yet, 
        // but gemini-flash-latest is the standard now.
        // Using systemInstruction which is supported in newer SDKs for better results.
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent({
            contents: [
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
                { role: 'user', parts: [{ text: userMessage }] }
            ]
        });

        const response = await result.response;
        return response.text();
    } catch (error) {
        // Fallback to gemini-pro-latest if gemini-1.5-flash is not available
        if (error.message.includes('404') || error.message.includes('not found')) {
            try {
                const fallbackModel = genAI.getGenerativeModel({
                    model: "gemini-pro-latest",
                });

                const result = await fallbackModel.generateContent({
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt }] },
                        { role: 'model', parts: [{ text: "Understood. I'll help as Yegna AI Assistant." }] },
                        ...history.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'model',
                            parts: [{ text: msg.content }],
                        })),
                        { role: 'user', parts: [{ text: userMessage }] }
                    ]
                });
                const response = await result.response;
                return response.text();
            } catch (fallbackError) {
                console.error("AI Fallback Error:", fallbackError);
                throw fallbackError;
            }
        }
        console.error("AI Service Error:", error);
        throw new Error("Failed to get AI response: " + error.message);
    }
};

/**
 * Get Traffic Analytics for all Fermatas
 * @returns {Promise<Array>}
 */
const getTrafficAnalytics = async (prisma) => {
    try {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        // Get all fare payments in the last hour
        const transactions = await prisma.transaction.findMany({
            where: {
                type: 'FARE_PAYMENT',
                amount: { lt: 0 }, // Passenger payments are negative in this system
                createdAt: { gte: oneHourAgo }
            },
            include: {
                relatedUser: { // The driver
                    include: {
                        fermatas: true
                    }
                }
            }
        });

        // Aggregate by Fermata
        const fermataStats = {};

        // Fetch all fermatas first to ensure we include quiet ones
        const allFermatas = await prisma.fermata.findMany();
        allFermatas.forEach(f => {
            fermataStats[f.id] = {
                id: f.id,
                name: f.name,
                fare: f.fare,
                transactionCount: 0,
                drivers: [] // List of assigned drivers
            };
        });

        // Count transactions (same logic as before)
        transactions.forEach(t => {
            if (t.relatedUser && t.relatedUser.fermatas && t.relatedUser.fermatas.length > 0) {
                const fId = t.relatedUser.fermatas[0].id;
                if (fermataStats[fId]) {
                    fermataStats[fId].transactionCount++;
                }
            }
        });

        // Count and list active drivers per fermata
        const drivers = await prisma.user.findMany({
            where: { role: 'DRIVER' },
            include: { fermatas: true }
        });

        drivers.forEach(d => {
            d.fermatas.forEach(f => {
                if (fermataStats[f.id]) {
                    fermataStats[f.id].drivers.push({
                        id: d.id,
                        name: d.name,
                        userId: d.userId
                    });
                }
            });
        });

        // Add a simple count for easy access in UI
        Object.values(fermataStats).forEach(f => {
            f.driverCount = f.drivers.length;
        });

        return Object.values(fermataStats);
    } catch (error) {
        console.error("Traffic Analytics Error:", error);
        throw error;
    }
};

/**
 * Get AI-driven recommendations for Admin
 * @param {Array} trafficData 
 * @returns {Promise<string>}
 */
const getAdminRecommendations = async (trafficData) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: "You are the Yegna AI Logistics Assistant. Analyze transit traffic data and suggest driver reassignments to balance load."
        });

        const dataSummary = trafficData.map(f =>
            `- Station: ${f.name}, Drivers: ${f.driverCount}, Recent Boardings: ${f.transactionCount}, Fare: ${f.fare}`
        ).join('\n');

        const prompt = `
Current Station Statistics (Last 1 hour):
${dataSummary}

Task:
Analyze the data and provide 2-3 specific recommendations for the administrator.
Identify "Hot" stations (high boardings/low drivers) and "Cold" stations (low boardings/high drivers).
Suggest specific reassignments. Keep it concise, professional, and actionable.
Format as a bulleted list.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return "Unable to generate AI recommendations at this time. Please check the raw traffic data below.";
    }
};

module.exports = {
    getChatResponse,
    getTrafficAnalytics,
    getAdminRecommendations,
};
