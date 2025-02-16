import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        content: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;