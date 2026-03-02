import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const generateGeminiResponse = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash"; // Updated to 2.5-flash as verified to have quota

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in .env");
        throw new Error("API Key configuration error");
    }

    try {
        console.log(`Manual fetch attempt with ${model}... (Key prefix: ${apiKey.substring(0, 5)})`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(`GEMINI API ERROR:`, JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Gemini API failed");
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        console.error("Unexpected Gemini response structure:", data);
        return "I'm sorry, I'm having trouble processing that request.";

    } catch (error) {
        console.error("GEMINI ERROR:", error.message);
        throw error;
    }
};
