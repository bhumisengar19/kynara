import dotenv from "dotenv";
import { generateGeminiResponse } from "./gemini.js";

dotenv.config();

const testGemini = async () => {
    try {
        console.log("Testing Gemini API...");
        const response = await generateGeminiResponse("Hello, are you working?");
        console.log("Response:", response);
    } catch (error) {
        console.error("Test Failed:", error.message);
    }
};

testGemini();
