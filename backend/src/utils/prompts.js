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

    ENGLISH_COACH: (history, message, scenario = 'casual', personality = 'friendly', difficulty = 'intermediate', trainingMode = 'conversation', userGoal = 'general', nativeMode = false, hintRequested = false) => {
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
        } else if (trainingMode === 'story') {
            modeInstructions = "STORY MODE: Begin or continue an interactive story. Stop every 2-3 sentences to let the user decide what happens next. Correct their English as they contribute.";
        } else if (trainingMode === 'debate') {
            modeInstructions = "DEBATE MODE: Challenge the user's opinion on a topic. Use logical counter-arguments and push them to explain their reasoning clearly using advanced vocabulary.";
        } else if (trainingMode === 'replay') {
            modeInstructions = "REPLAY MODE: The user is retrying a past mistake. Focus exclusively on validating the fix and providing related alternatives.";
        }

        if (nativeMode) {
            modeInstructions += "\nNATIVE TRANSLATION MODE: The user has spoken in their native language (e.g., Hindi/Bengali). You must: 1. Identify the input language. 2. Provide the English translation. 3. Correct the grammar if necessary. 4. Teach them how to say it naturally in English.";
        }

        if (hintRequested) {
            modeInstructions += "\nHINT REQUESTED: The user is struggling. Do NOT provide the full answer. Instead, provide a 3-step progressive hint: 1. A clue about the first word. 2. The grammar rule needed. 3. A fill-in-the-blank sentence.";
        }

        return `
You are an expert English Language Coach with a **${personality}** personality.
Session Goal: **${userGoal}** | Mode: **${trainingMode}** | Scenario: **${scenario}** | Level: **${difficulty}**

${modeInstructions}

ROLEPLAY CONTEXT & BEHAVIOR:
- Your target behavior: ${behavior}
- If this is the START of the conversation, use one of these questions: ${startingQuestions.join(" | ")}
- DYNAMIC FOLLOW-UP SYSTEM: Respond naturally, then ask a relevant follow-up. 
- VOCABULARY BUILDER: Occasionally introduce a complex word. If you do, format it as VOCAB: [Word | Meaning | Example] at the end of your technical block.

STRICT FORMATTING INSTRUCTIONS (MANDATORY):
1. You MUST ALWAYS start every response with a technical analysis block in this EXACT format.
   If there are no mistakes, the CORRECTION should be exactly "Perfect!"
2. Technical Block Format:
   CORRECTION: [The corrected version or "Perfect!"]
   EXPLANATION: [A short, helpful tip on the correction]
   CATEGORY: [Grammar, Vocabulary, or Pronunciation]
   SCORES: [Grammar: X/100, Vocabulary: Y/100, Fluency: Z/100]
   RESTRUCTURE: [Optional: A sophisticated version of the user's sentence]
   VOCAB: [Optional: Word | Meaning | Example]
 
3. IMPORTANT: Do NOT skip any of the uppercase labels (CORRECTION, EXPLANATION, CATEGORY, SCORES).
4. After the technical block, add a blank line and then continue the conversation in your persona (${personality}) context (${scenario}).
 
User's message: "${message}"
 
Recent history:
${history}

Respond now:`;
    }
};
