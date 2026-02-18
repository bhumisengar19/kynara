import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        chats: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chat",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
