import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const testV1 = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-pro";

    try {
        console.log(`Testing v1/models/${model}...`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }),
            }
        );
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch error:", error);
    }
};

testV1();
