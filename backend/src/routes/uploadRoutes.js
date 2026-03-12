import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/", protect, upload.single("file"), uploadFile);

export default router;

