import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro"
];

const findModel = async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    for (const name of modelsToTry) {
        console.log(`Trying ${name}...`);
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            if (response.text()) {
                console.log(`✅ SUCCESS with ${name}`);
                process.exit(0);
            }
        } catch (e) {
            console.log(`❌ FAILED ${name}: ${e.message}`);
        }
    }
};

findModel();
