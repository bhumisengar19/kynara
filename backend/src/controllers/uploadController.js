import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ImageKit Setup (Only if valid keys)
let imagekit = null;
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PUBLIC_KEY !== "dummy") {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
}

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileName = `${Date.now()}-${req.file.originalname}`;

        if (imagekit) {
            // Upload to ImageKit
            const ikRes = await imagekit.upload({
                file: req.file.buffer,
                fileName: fileName,
                folder: "kynara_uploads",
            });

            return res.status(200).json({
                message: "File uploaded successfully (Cloud)",
                fileUrl: ikRes.url,
                fileName: ikRes.name,
                fileType: req.file.mimetype,
            });
        } else {
            // Local Storage Fallback
            const uploadDir = path.join(__dirname, "../../uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const localPath = path.join(uploadDir, fileName);
            fs.writeFileSync(localPath, req.file.buffer);

            const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

            return res.status(200).json({
                message: "File uploaded successfully (Local)",
                fileUrl,
                fileName,
                fileType: req.file.mimetype,
            });
        }
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ message: "File upload failed", error: error.message });
    }
};
