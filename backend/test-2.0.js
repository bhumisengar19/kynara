import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-2.5-flash";

async function testGemini() {
    console.log(`Testing Gemini API with model: ${model}`);
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
            }
        );

        const data = await response.json();
        if (response.ok) {
            console.log("✅ Success!");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.error("❌ Failed:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testGemini();
