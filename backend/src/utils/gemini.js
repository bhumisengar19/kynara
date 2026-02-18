import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const generateGeminiResponse = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("GEMINI ERROR:", data);
        throw new Error("Gemini API failed");
    }

    return data.candidates[0].content.parts[0].text;
};
