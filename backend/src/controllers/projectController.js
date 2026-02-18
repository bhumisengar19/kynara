import Project from "../models/Project.js";

/*
========================================
        CREATE PROJECT
========================================
*/
export const createProject = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Project title required" });
        }

        const project = await Project.create({
            user: req.user._id,
            title,
            description,
            chats: [],
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: "Failed to create project" });
    }
};

/*
========================================
        GET USER PROJECTS
========================================
*/
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id })
            .populate("chats", "title updatedAt")
            .sort({ updatedAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch projects" });
    }
};

/*
========================================
        UPDATE PROJECT
========================================
*/
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Failed to update project" });
    }
};

/*
========================================
        DELETE PROJECT
========================================
*/
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json({ message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete project" });
    }
};

/*
========================================
        ADD CHAT TO PROJECT
========================================
*/
export const addChatToProject = async (req, res) => {
    try {
        const { chatId } = req.body;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $addToSet: { chats: chatId } },
            { new: true }
        ).populate("chats", "title");

        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Failed to add chat to project" });
    }
};

/*
========================================
        REMOVE CHAT FROM PROJECT
========================================
*/
export const removeChatFromProject = async (req, res) => {
    try {
        const { chatId } = req.body;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $pull: { chats: chatId } },
            { new: true }
        ).populate("chats", "title");

        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Failed to remove chat" });
    }
};
