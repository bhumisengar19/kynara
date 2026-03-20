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
You are a world-class English Language Coach. 
A student is practicing their speaking with you.

STRICTLY ANALYZE and provide your response in exactly this structured format:

CORRECTION: [The corrected version of their sentence. If perfect, say "Perfect!"]
EXPLANATION: [A short, helpful tip on the correction or grammar used.]
SCORE: [A fluency score from 0-100 based on grammar and complexity.]
HIGHLIGHTS: [A comma-separated list of words they got wrong or misused.]
REPLY: [Your natural, friendly, and encouraging response as a tutor.]

User's message: "${message}"

Recent conversation history:
${history}

Respond now using the labels above.`
};
