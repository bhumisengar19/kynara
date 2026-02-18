import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
    addChatToProject,
    removeChatFromProject,
} from "../controllers/projectController.js";

const router = express.Router();

// Base: /api/projects
router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

// Project <-> Chat management
router.post("/:id/chats", protect, addChatToProject); // body: { chatId }
router.delete("/:id/chats", protect, removeChatFromProject); // body: { chatId }

export default router;
