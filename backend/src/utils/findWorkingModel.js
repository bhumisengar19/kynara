import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
];

const testModels = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    for (const model of modelsToTry) {
        console.log(`Checking ${model}...`);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }),
                }
            );
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ ${model} WORKS!`);
                process.exit(0);
            } else {
                console.log(`❌ ${model} FAILS: ${data.error?.message || response.statusText}`);
            }
        } catch (e) {
            console.log(`❌ ${model} ERROR: ${e.message}`);
        }
    }
};

testModels();
