import mongoose from "mongoose";

const appSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true, // e.g., 'Productivity', 'Coding'
        },
        icon: {
            type: String, // Lucide icon name or URL
            required: true,
        },
        route: {
            type: String, // e.g., 'code-runner'
            required: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("App", appSchema);
