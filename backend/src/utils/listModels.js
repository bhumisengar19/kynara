import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    if (response.ok) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log("Error listing models:", data);
    }
  } catch (e) {
    console.log("Fatal Error:", e.message);
  }
};

listModels();
