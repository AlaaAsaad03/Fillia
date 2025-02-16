import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel" },
        senderModel: { type: String, enum: ["user", "Admin"], required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, refPath: "receiverModel" },
        receiverModel: { type: String, enum: ["user", "Admin"], required: true },
        message: { type: String, required: true },
        isViewed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const notificationModel = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default notificationModel;