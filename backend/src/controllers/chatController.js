import Chat from "../models/Chat.js";
import { generateGeminiResponse } from "../utils/gemini.js";

/*
========================================
        CREATE NEW CHAT
========================================
*/
export const createNewChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user._id,
      title: "New Chat",
      messages: [],
    });

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
  try {
    const { message, chatId } = req.body;

    if (!message || !chatId) {
      return res.status(400).json({ message: "Message and chatId required" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Add user message
    chat.messages.push({
      role: "user",
      content: message,
    });

    // MASTER SYSTEM PROMPT
    const systemPrompt = `You are Kynara AI.
Chat Session Rules:
- Treat each session as fresh.
- Be professional, concise, and helpful.
- Do not mention that you are an AI unless asked.
`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Parallel Execution: Generate Response + Title (if first message)
    const replyPromise = generateGeminiResponse(fullPrompt);
    let titlePromise = null;

    // Check if this is the first interaction (only one user message so far)
    if (chat.messages.length === 1) {
      const titlePrompt = `Generate a 3-6 word short, professional, and concave title for a chat that starts with this message: "${message}". 
Rules:
- Capitalize properly.
- No punctuation.
- No "Chat" or generic words.
- Strictly 3-6 words.
- No quotes.`;
      titlePromise = generateGeminiResponse(titlePrompt);
    }

    const [reply, generatedTitle] = await Promise.all([replyPromise, titlePromise]);

    // Add assistant response
    chat.messages.push({
      role: "assistant", // Fixed role for db
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
    res.status(500).json({ message: "Chat failed" });
  }
};
