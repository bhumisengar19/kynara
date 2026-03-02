import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-1.5-flash";

async function testGemini() {
    console.log(`Testing Gemini API with model: ${model}`);
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
            }
        );

        const data = await response.json();
        if (response.ok) {
            console.log("✅ Gemini API is working!");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.error("❌ Gemini API failed:", data);
        }
    } catch (error) {
        console.error("❌ Network/Fetch error:", error.message);
    }
}

testGemini();
