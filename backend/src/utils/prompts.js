export const PROMPTS = {
    MEMORY_CHAT: (history, currentMessage, instructions = "") => `Here is the conversation so far:
${history}

User: ${currentMessage}

${instructions || "Respond naturally. Keep context from previous messages and respond clearly."}`,

    HUMANIZE: (aiResponse) => `Rewrite the following AI response in a more natural, friendly, and human-like tone. 
Make it conversational and easy to understand.

Response:
${aiResponse}`,

    REGENERATE: () => `Give another version of the previous answer.
Keep the meaning same but change the explanation style and wording.
Make it clear and helpful.`,

    SUMMARIZE: (text) => `Summarize the following text in simple and clear language:

${text}`,

    EXPLAIN_SIMPLY: (topic) => `Explain the following topic as if you are teaching a beginner.
Use simple words and examples:

${topic}`,

    TRANSLATE: (text, language) => `Translate the following text into ${language}.
Keep the meaning accurate and natural:

${text}`,

    IMPROVE_GRAMMAR: (text) => `Correct grammar and improve clarity of the following text.
Do not change the meaning:

${text}`,

    GENERATE_TITLE: (history) => `Based on this conversation, generate a short 3–5 word title:
 
 ${history}`,

    ENGLISH_COACH: (history, message) => `
You are an expert English Language Coach and conversational partner. 
The user is practicing their spoken English with you. 

STRICT INSTRUCTIONS:
1. First, analyze the user's message for ANY errors (grammar, spelling, word choice, or unnatural phrasing).
2. Start your response EXACTLY in this format:
   CORRECTION: [The corrected version of their sentence or "Perfect!"]
   EXPLANATION: [A short, helpful tip on the correction or "Your sentence was great!"]

3. CRITICAL: Continue the conversation normally by responding directly to the CONTENT of what the user said. Be a friendly, engaged partner. Answer their questions, comment on their thoughts, and keep the discussion moving naturally. Do NOT just give a correction; you must have a real conversation with them.

User's message: "${message}"

Recent conversation history:
${history}

Respond now:`
};
