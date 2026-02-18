import mongoose from "mongoose";

const userAppSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        app: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "App",
            required: true,
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
        installedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Ensure a user can only install an app once
userAppSchema.index({ user: 1, app: 1 }, { unique: true });

export default mongoose.model("UserApp", userAppSchema);
