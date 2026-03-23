const PRO_ROLEPLAY_BANK = {
    interview: {
        behavior: "Professional tone, follow-up questions, slight pressure.",
        beginner: ["Tell me about yourself.", "Why do you want this job?", "What are your strengths?"],
        intermediate: ["Describe a challenge you faced and how you handled it.", "Why should we hire you?", "Where do you see yourself in 5 years?"],
        advanced: ["Explain a failure and what you learned from it.", "How do you handle pressure and deadlines?", "Tell me about a time you showed leadership."]
    },
    shopping: {
        behavior: "Casual + interactive, real-life simulation.",
        beginner: ["What do you want to buy?", "Do you prefer online or offline shopping?", "How often do you go shopping?"],
        intermediate: ["Can you ask for a discount?", "How would you return a product?", "Explain what you're looking for in a store."],
        advanced: ["Handle a complaint about a defective product.", "Negotiate price with a shopkeeper.", "Explain why you prefer a certain brand."]
    },
    travel: {
        behavior: "Slightly formal, real-world scenarios.",
        beginner: ["Where are you traveling to?", "What is your purpose of travel?", "Do you have your passport?"],
        intermediate: ["How would you ask for directions at the airport?", "Explain your travel plan.", "Ask about flight delays."],
        advanced: ["Handle lost luggage situation.", "Talk to immigration officer confidently.", "Explain a travel emergency."]
    },
    casual: {
        behavior: "Friendly, Encouraging, Relaxed tone.",
        beginner: ["How was your day?", "What are your hobbies?", "What do you like to do in your free time?"],
        intermediate: ["Talk about your favorite movie.", "Describe your best friend.", "What do you usually do on weekends?"],
        advanced: ["Discuss your opinions on social media.", "Talk about your goals in life.", "Describe a memorable experience."]
    },
    presentation: {
        behavior: "Listener mode, gives feedback after speaking.",
        beginner: ["Introduce yourself to an audience.", "Talk about your college.", "Explain your favorite subject."],
        intermediate: ["Explain a topic for 1 minute.", "Describe a process step-by-step.", "Present a small idea."],
        advanced: ["Pitch a startup idea.", "Explain a technical concept clearly.", "Deliver a persuasive speech."]
    },
    doctor: {
        behavior: "Professional, caring, investigative.",
        beginner: ["What problem are you facing?", "How long have you had this issue?", "Do you have any pain?"],
        intermediate: ["Explain your symptoms clearly.", "Ask for medication instructions.", "Describe your health routine."],
        advanced: ["Explain a complex health issue.", "Discuss treatment options.", "Ask detailed medical questions."]
    },
    restaurant: {
        behavior: "Polite, helpful waiter tone.",
        beginner: ["What would you like to order?", "Do you want something to drink?"],
        intermediate: ["Ask about menu items.", "Request customization.", "Complain about food politely."],
        advanced: ["Handle wrong order situation.", "Give feedback to waiter.", "Discuss dietary preferences."]
    }
};

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

    ENGLISH_COACH: (history, message, scenario = 'casual', personality = 'friendly', difficulty = 'intermediate', trainingMode = 'conversation') => {
        const scenarioData = PRO_ROLEPLAY_BANK[scenario] || PRO_ROLEPLAY_BANK['casual'];
        const startingQuestions = scenarioData[difficulty] || scenarioData['intermediate'];
        const behavior = scenarioData.behavior;

        let modeInstructions = "";
        if (trainingMode === 'shadowing') {
            modeInstructions = "SHADOWING MODE: Provide a short, natural sentence (5-10 words) for the user to repeat. Focus on intonation and rhythm.";
        } else if (trainingMode === 'thinkfast') {
            modeInstructions = "THINK FAST MODE: Ask rapid, short questions. Keep your responses extremely brief (under 15 words) to maintain pressure.";
        } else if (trainingMode === 'mocktest') {
            modeInstructions = "MOCK TEST MODE: Act as an official examiner. Evaluate the user's performance and provide a final score at the end of the session.";
        }

        return `
You are an expert English Language Coach with a **${personality}** personality.
Current Mode: **${trainingMode}** | Scenario: **${scenario}** | Level: **${difficulty}**

${modeInstructions}

ROLEPLAY CONTEXT & BEHAVIOR:
- Your target behavior: ${behavior}
- If this is the START of the conversation, use one of these questions: ${startingQuestions.join(" | ")}
- DYNAMIC FOLLOW-UP SYSTEM: Respond naturally, then ask a relevant follow-up. 
- CONFIDENCE/BEHAVIOR: Note if the user used many fillers (um, uh) or sounded hesitant in their previous message: "${message}".

STRICT FORMATTING INSTRUCTIONS:
1. First, analyze the user's message for errors.
2. Start your response in this EXACT format:
   CORRECTION: [The corrected version or "Perfect!"]
   EXPLANATION: [A short, helpful tip on the correction]
   CATEGORY: [Grammar, Vocabulary, or Pronunciation]
   SCORES: [Grammar: X/100, Vocabulary: Y/100, Fluency: Z/100]

3. Continue the conversation as your persona (${personality}) in the context (${scenario}).

User's message: "${message}"

Recent history:
${history}

Respond now:`;
    }
};
