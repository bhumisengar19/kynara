import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { limiter } from "../middleware/rateLimiter.js";

import {
  sendMessage,
  getChatHistory,
  getUserChats,
  createNewChat,
  getArchivedChats,
  archiveChat,
  unarchiveChat,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", protect, limiter, sendMessage);
router.get("/all", protect, getUserChats);
router.get("/archived", protect, getArchivedChats);
router.get("/history/:chatId", protect, getChatHistory);
router.post("/new", protect, createNewChat);
router.put("/archive/:chatId", protect, archiveChat);
router.put("/unarchive/:chatId", protect, unarchiveChat);
router.delete("/:chatId", protect, deleteChat);

export default router;
