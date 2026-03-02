import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

listModels();
