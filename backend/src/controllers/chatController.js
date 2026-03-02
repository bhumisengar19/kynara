import Chat from "../models/Chat.js";
import { generateGeminiResponse } from "../utils/gemini.js";
import { PROMPTS } from "../utils/prompts.js";

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
  console.log("Received sendMessage request:", req.body);
  try {
    const { message, chatId, action, targetLanguage } = req.body;

    if ((!message && !action) || !chatId) {
      console.warn("Missing message or chatId");
      return res.status(400).json({ message: "Content and chatId required" });
    }

    console.log(`Finding chat ${chatId} for user ${req.user._id}...`);
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
      });

      // Get conversation history (excluding the message we just added)
      const history = formatHistory(chat.messages.slice(0, -1));
      prompt = PROMPTS.MEMORY_CHAT(history, message);
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
