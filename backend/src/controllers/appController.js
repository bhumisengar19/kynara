import App from "../models/App.js";
import UserApp from "../models/UserApp.js";

/*
========================================
        GET ALL APPS (With Search & Category)
========================================
*/
export const getAllApps = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { isActive: true };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category) {
            query.category = category;
        }

        const apps = await App.find(query).sort({ name: 1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch apps" });
    }
};

/*
========================================
        GET INSTALLED APPS
========================================
*/
export const getInstalledApps = async (req, res) => {
    try {
        const userApps = await UserApp.find({ user: req.user._id })
            .populate("app")
            .sort({ createdAt: -1 });

        res.json(userApps.map(ua => ({
            ...ua.app.toObject(),
            isEnabled: ua.isEnabled,
            installedAt: ua.installedAt,
            _id: ua.app._id, // Keep app ID prominent
            userAppId: ua._id // Keep track of UserApp ID if needed mainly for toggle
        })));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch installed apps" });
    }
};

/*
========================================
        INSTALL APP
========================================
*/
export const installApp = async (req, res) => {
    try {
        const { appId } = req.body;
        if (!appId) return res.status(400).json({ message: "App ID required" });

        // Check if duplicate
        const existing = await UserApp.findOne({ user: req.user._id, app: appId });
        if (existing) return res.status(400).json({ message: "App already installed" });

        const userApp = await UserApp.create({
            user: req.user._id,
            app: appId,
        });

        res.status(201).json(userApp);
    } catch (error) {
        res.status(500).json({ message: "Failed to install app" });
    }
};

/*
========================================
        UNINSTALL APP
========================================
*/
export const uninstallApp = async (req, res) => {
    try {
        const { appId } = req.params;
        const deleted = await UserApp.findOneAndDelete({ user: req.user._id, app: appId });
        if (!deleted) return res.status(404).json({ message: "App not found or not installed" });
        res.json({ message: "App uninstalled" });
    } catch (error) {
        res.status(500).json({ message: "Failed to uninstall app" });
    }
};

/*
========================================
        TOGGLE APP (Enable/Disable)
========================================
*/
export const toggleApp = async (req, res) => {
    try {
        const { appId } = req.params;
        const userApp = await UserApp.findOne({ user: req.user._id, app: appId });

        if (!userApp) return res.status(404).json({ message: "App not installed" });

        userApp.isEnabled = !userApp.isEnabled;
        await userApp.save();

        res.json({ message: `App ${userApp.isEnabled ? 'Enabled' : 'Disabled'}`, isEnabled: userApp.isEnabled });
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle app" });
    }
};

/*
========================================
        SEED APPS (Helper Endpoint)
========================================
*/
export const seedApps = async (req, res) => {
    const sampleApps = [
        { name: "Code Runner", description: "Execute Python, JavaScript, and C++ code directly in your browser.", category: "Coding", icon: "Code", route: "code-runner" },
        { name: "Resume Builder", description: "Build professional resumes with AI-generated suggestions.", category: "Productivity", icon: "FileText", route: "resume-builder" },
        { name: "AI Image Generator", description: "Generate stunning images from text prompts using DALL-E.", category: "Design", icon: "Image", route: "image-gen" },
        { name: "PDF Analyzer", description: "Use AI to summarize, extract, and chat with PDF documents.", category: "Research", icon: "FileCheck", route: "pdf-analyzer" },
        { name: "GitHub Sync", description: "Sync your repositories and automate workflow directly from Kynara.", category: "Coding", icon: "Github", route: "github-sync" },
        { name: "SQL Playground", description: "Test SQL queries and visualize database schemas instantly.", category: "Coding", icon: "Database", route: "sql-playground" },
        { name: "Data Visualizer", description: "Convert JSON/CSV data into interactive charts and graphs.", category: "Finance", icon: "BarChart", route: "data-viz" },
        { name: "Task Kanban", description: "Project management board for agile workflows.", category: "Productivity", icon: "LayoutKanban", route: "kanban" },
        { name: "Currency Converter", description: "Real-time exchange rates and financial calculator.", category: "Finance", icon: "DollarSign", route: "currency" },
        { name: "Mind Mapper", description: "Visualize ideas with AI-assisted mind mapping.", category: "Productivity", icon: "Share2", route: "mind-map" }
    ];

    try {
        let createdCount = 0;
        for (const appData of sampleApps) {
            const exists = await App.findOne({ route: appData.route });
            if (!exists) {
                await App.create(appData);
                createdCount++;
            }
        }
        res.json({ message: `Seeded ${createdCount} new apps.` });
    } catch (error) {
        res.status(500).json({ message: "Seeding failed", error: error.message });
    }
};
