const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache for AI recommendations and forecasts (10 minutes)
const aiCache = {
    recommendations: { data: null, timestamp: 0 },
    forecast: { data: null, timestamp: 0 }
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

        // 1. Fetch all fermatas with their assigned drivers (Station-first approach)
        const fermatas = await prisma.fermata.findMany({
            include: {
                drivers: {
                    select: {
                        id: true,
                        name: true,
                        userId: true
                    }
                }
            }
        });

        // 2. Get all fare payments in the last hour
        // We now filter by fermataId if possible, or fall back to driver's first station
        const transactions = await prisma.transaction.findMany({
            where: {
                type: 'FARE_PAYMENT',
                amount: { lt: 0 },
                createdAt: { gte: oneHourAgo }
            },
            include: {
                relatedUser: {
                    include: {
                        fermatas: { select: { id: true } }
                    }
                }
            }
        });

        // 3. Map transactions to fermatas
        const statsMap = {};
        fermatas.forEach(f => {
            statsMap[f.id] = {
                id: f.id,
                name: f.name,
                fare: f.fare,
                transactionCount: 0,
                driverCount: f.drivers.length,
                drivers: f.drivers
            };
        });

        transactions.forEach(t => {
            let fId = t.fermataId;
            
            // Fallback for legacy transactions without fermataId
            if (!fId && t.relatedUser && t.relatedUser.fermatas && t.relatedUser.fermatas.length > 0) {
                fId = t.relatedUser.fermatas[0].id;
            }

            if (fId && statsMap[fId]) {
                statsMap[fId].transactionCount++;
            }
        });

        return Object.values(statsMap);
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
        const now = Date.now();
        // Check cache
        if (aiCache.recommendations.data && (now - aiCache.recommendations.timestamp < CACHE_TTL)) {
            console.log("Returning cached AI recommendations");
            return aiCache.recommendations.data;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: "You are the Yegna AI Logistics Assistant. Analyze transit traffic data and suggest driver reassignments to balance load."
        });

        const dataSummary = trafficData.map(f =>
            `- Station: ${f.name}, Drivers: ${f.driverCount}, Recent Boardings: ${f.transactionCount}, Fare: ${f.fare}`
        ).join('\n');

        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        const prompt = `
Current Local Time: ${currentTime}
Current Station Statistics (Last 1 hour):
${dataSummary}

Task:
Analyze the data and provide 2-3 specific recommendations for the administrator.
Identify "Hot" stations (high boardings/low drivers) and "Cold" stations (low boardings/high drivers).
Suggest specific reassignments. Keep it concise, professional, and actionable.
Format as a bulleted list.
`;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Update cache
        aiCache.recommendations = { data: responseText, timestamp: now };
        return responseText;
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        // Fallback to cache if error (even if expired)
        if (aiCache.recommendations.data) return aiCache.recommendations.data;
        return "Unable to generate AI recommendations at this time. Please check the raw traffic data below.";
    }
};

/**
 * Get AI-driven demand forecast
 * @param {object} prisma 
 * @returns {Promise<object>}
 */
const getDemandForecast = async (prisma) => {
    try {
        const now = Date.now();
        // Check cache
        if (aiCache.forecast.data && (now - aiCache.forecast.timestamp < CACHE_TTL)) {
            console.log("Returning cached AI forecast");
            return aiCache.forecast.data;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch historical transaction volume per hour for the last 7 days
        // Fixing UTC to local timezone offset for Ethiopia (Africa/Addis_Ababa)
        const historyQuery = `
            SELECT 
                "fermataId",
                EXTRACT(HOUR FROM ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Addis_Ababa')) as hour,
                COUNT(*) as volume
            FROM "Transaction"
            WHERE type = 'FARE_PAYMENT' 
              AND amount < 0
              AND "createdAt" >= $1
              AND "fermataId" IS NOT NULL
            GROUP BY "fermataId", hour
        `;
        
        const history = await prisma.$queryRawUnsafe(historyQuery, sevenDaysAgo);
        const fermatas = await prisma.fermata.findMany({ select: { id: true, name: true } });

        if (history.length === 0) {
            return { error: "Insufficient historical data for accurate prediction." };
        }

        // Format data for AI analysis
        const historicalSummary = history.map(h => {
            const station = fermatas.find(f => f.id === h.fermataId)?.name || 'Unknown';
            return `Station: ${station}, Local Hour: ${h.hour}:00, Avg Volume: ${h.volume}`;
        }).join('\n');

        const localTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: `You are the Yegna AI Demand Predictor. Current local time is ${localTime}. Predict traffic patterns for the next 4 hours based on local time history.`
        });

        const prompt = `
Current Local Time: ${localTime}
Historical Patterns (Last 7 days, localized to Africa/Addis_Ababa):
${historicalSummary}

Task:
Generate a 4-hour demand forecast FOR THE NEXT 4 HOURS STARTING FROM ${localTime}.
For each station, provide:
1. Hourly heat levels (1-10).
2. A short label (e.g., "Normal", "Peak Start", "High Demand").
Also identify the "Hottest Station" and provide a 1-sentence summary of the trend.

Return JSON in this EXACT format:
{
  "hottestStation": "Station Name",
  "summary": "AI general insight about traffic trends",
  "forecast": [
    {
      "stationId": "uuid",
      "stationName": "Name",
      "hourlyPredictions": [
        { "hour": "HH:00", "heatLevel": 8, "label": "Peak" },
        ...3 more hours
      ]
    }
  ]
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Clean the markdown JSON wrapper if exists
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Update cache
            aiCache.forecast = { data: parsed, timestamp: now };
            return parsed;
        }
        
        throw new Error("AI failed to return valid JSON forecast");
    } catch (error) {
        console.error("Demand Forecast Error:", error);
        // Fallback to cache if error
        if (aiCache.forecast.data) return aiCache.forecast.data;
        return { error: "Failed to generate AI forecast. Please check back later." };
    }
};

module.exports = {
    getChatResponse,
    getTrafficAnalytics,
    getAdminRecommendations,
    getDemandForecast
};
