import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const listModels = async () => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
  );

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
};

listModels();
