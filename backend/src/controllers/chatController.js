import Chat from "../models/Chat.js";
import { generateGeminiResponse } from "../utils/gemini.js";
import { PROMPTS } from "../utils/prompts.js";
import { extractTextFromFile } from "../utils/fileExtractor.js";

const formatHistory = (messages) => {
  return messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
};

/*
========================================
        CREATE NEW CHAT
========================================
*/
export const createNewChat = async (req, res) => {
  console.log("createNewChat called by user:", req.user?._id);
  try {
    const chat = await Chat.create({
      user: req.user._id,
      title: "New Chat",
      messages: [],
    });
    console.log("Chat created successfully:", chat._id);

    res.status(201).json(chat);
  } catch (error) {
    console.error("CREATE CHAT ERROR:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

/*
========================================
        GET ALL USER CHATS (SIDEBAR)
========================================
*/
export const getUserChats = async (req, res) => {
  console.log("getUserChats called by user:", req.user?._id);
  try {
    const chats = await Chat.find({
      user: req.user._id,
      isArchived: { $ne: true } // Exclude archived
    })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error("GET CHATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

/*
========================================
        GET ARCHIVED CHATS
========================================
*/
export const getArchivedChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user._id,
      isArchived: true
    })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error("GET ARCHIVED CHATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch archived chats" });
  }
};

/*
========================================
        ARCHIVE CHAT
========================================
*/
export const archiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user._id },
      { isArchived: true },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat archived", chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to archive chat" });
  }
};

/*
========================================
        UNARCHIVE CHAT
========================================
*/
export const unarchiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user._id },
      { isArchived: false },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat unarchived", chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to unarchive chat" });
  }
};

/*
========================================
        RENAME CHAT
========================================
*/
export const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user._id },
      { title },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat renamed", chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to rename chat" });
  }
};

/*
========================================
        DELETE CHAT (PERMANENT)
========================================
*/
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user._id
    });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat" });
  }
};

/*
========================================
        GET SINGLE CHAT HISTORY
========================================
*/
export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat.messages);
  } catch (error) {
    console.error("GET CHAT HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

/*
========================================
        SEND MESSAGE
========================================
*/
/*
========================================
        SEND MESSAGE
========================================
*/
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId, action, targetLanguage, attachments, deepSearch, conciseMode, persona } = req.body;

    if ((!message && !action && (!attachments || attachments.length === 0)) || !chatId) {
      console.warn("Missing message, action, or attachments; or missing chatId");
      return res.status(400).json({ message: "Content and chatId required" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    let prompt = "";
    let isAction = false;

    // Handle special actions
    if (action) {
      isAction = true;
      switch (action.toLowerCase()) {
        case 'summarize':
          prompt = PROMPTS.SUMMARIZE(message);
          break;
        case 'humanize':
          prompt = PROMPTS.HUMANIZE(message);
          break;
        case 'explain':
          prompt = PROMPTS.EXPLAIN_SIMPLY(message);
          break;
        case 'translate':
          prompt = PROMPTS.TRANSLATE(message, targetLanguage || 'English');
          break;
        case 'grammar':
          prompt = PROMPTS.IMPROVE_GRAMMAR(message);
          break;
        case 'regenerate':
          const lastAssistantMessage = [...chat.messages].reverse().find(m => m.role === 'assistant');
          if (lastAssistantMessage) {
            prompt = PROMPTS.REGENERATE() + "\n\nPrevious Answer:\n" + lastAssistantMessage.content;
          } else {
            prompt = message; // Fallback
          }
          break;
        default:
          prompt = message;
      }
    } else {
      // Add user message to history
      chat.messages.push({
        role: "user",
        content: message,
        attachments: attachments || [],
      });

      // Get conversation history (excluding the message we just added)
      const history = formatHistory(chat.messages.slice(0, -1));
      let contextInfo = "";
      console.log(`[CHAT] Processing message from user. Input length: ${message?.length || 0}. Attachments: ${attachments?.length || 0}`);

      if (attachments?.length > 0) {
        // Extract text context from files in parallel
        console.log("[CHAT] Extracting text from attachments...");
        const extractionPromises = attachments.map(async (file) => {
          console.log(`[CHAT] Attempting extraction for: ${file.name} (${file.url})`);
          const text = await extractTextFromFile(file.url);
          if (text) {
            console.log(`[CHAT] Extracted ${text.length} chars from ${file.name}`);
            return `\n--- Content from ${file.name} ---\n${text}\n--- End of File content ---\n`;
          } else {
            console.warn(`[CHAT] No text extracted from ${file.name}`);
            return "";
          }
        });
        const extractedTexts = await Promise.all(extractionPromises);
        contextInfo = extractedTexts.join("\n").trim();
      }

      if (contextInfo) {
        console.log("[CHAT] Context successfully added to prompt.");
      } else if (attachments?.length > 0) {
        console.error("[CHAT] Attachments present but context is EMPTY!");
      }

      let userMsg = (contextInfo ? `CONTEXT FROM ATTACHED FILES:\n${contextInfo}\n\nUSER MESSAGE: ` : "") + (message || "");
      
      let systemInstructions = "";
      if (deepSearch) {
        systemInstructions = "You must perform a deep, comprehensive and highly detailed analysis thinking step by step, providing exhaustive depth and citing structured reasoning. Ensure the answer is elaborate. Do not mention you are following a system command.";
      } else if (conciseMode) {
        systemInstructions = "You MUST provide a direct, single-word or single-sentence answer only. Be extremely concise. Do not explain unless explicitly asked. Do not mention you are following a system command.";
      }
      
      if (persona === 'creative') {
        systemInstructions += "\nRespond in a highly creative, engaging, playful, and imaginative tone. Use vivid language.";
      } else if (persona === 'technical') {
        systemInstructions += "\nRespond in a highly technical, precise, and analytical tone. Focus on accuracy, structure, and professional domain knowledge.";
      }
      
      prompt = PROMPTS.MEMORY_CHAT(history, userMsg, systemInstructions);
    }

    // Parallel Execution: Generate Response + Title (if first message and not an action)
    const replyPromise = generateGeminiResponse(prompt);

    let titlePromise = Promise.resolve(null);
    if (!isAction && chat.messages.length === 1) {
      const historyForTitle = formatHistory(chat.messages);
      titlePromise = generateGeminiResponse(PROMPTS.GENERATE_TITLE(historyForTitle)).catch(err => {
        console.error("Title generation failed:", err.message);
        return null;
      });
    }

    const [reply, generatedTitle] = await Promise.all([replyPromise, titlePromise]);

    // Add assistant response
    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    // Update Title if generated
    let newTitle = null;
    if (generatedTitle) {
      newTitle = generatedTitle.trim().replace(/^"|"$/g, '').replace(/\.$/, '');
      chat.title = newTitle;
    }

    await chat.save();
    res.json({ reply, newTitle });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: error.message || "Chat failed" });
  }
};
