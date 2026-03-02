import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();
        if (response.ok) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
