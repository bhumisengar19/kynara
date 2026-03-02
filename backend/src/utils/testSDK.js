import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const testSDK = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Testing with gemini-1.5-flash via SDK...");
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log("✅ SDK Success:", response.text());
    } catch (error) {
        console.error("❌ SDK Failed:", error.message);

        try {
            console.log("Retrying with gemini-pro...");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log("✅ SDK Success (gemini-pro):", response.text());
        } catch (error2) {
            console.error("❌ SDK Failed (gemini-pro):", error2.message);
        }
    }
};

testSDK();
