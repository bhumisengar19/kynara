import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getAllApps,
    getInstalledApps,
    installApp,
    uninstallApp,
    toggleApp,
    seedApps,
} from "../controllers/appController.js";

const router = express.Router();

router.get("/", protect, getAllApps);
router.get("/installed", protect, getInstalledApps);
router.post("/install", protect, installApp);
router.delete("/uninstall/:appId", protect, uninstallApp);
router.put("/toggle/:appId", protect, toggleApp);
router.get("/seed", protect, seedApps); // Dev only

export default router;
