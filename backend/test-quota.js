import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function testQuota() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash";

    console.log(`Testing with ${model}...`);
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Respond with the word 'SUCCESS' if you get this." }] }] }),
            }
        );
        const data = await response.json();
        if (response.ok) {
            console.log("✅ Success! Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.error("❌ Failed:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("error:", e);
    }
}

testQuota();
