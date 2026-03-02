import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const testDirect = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-1.5-flash";
    const prompt = "Hi";

    try {
        console.log(`Testing model: ${model}`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
        );
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch error:", error);
    }
};

testDirect();
