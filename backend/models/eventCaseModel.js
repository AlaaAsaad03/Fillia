import mongoose from "mongoose";

const eventCaseSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amountRequired: { type: Number, required: true },
    amountCollected: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: function () { return this.amountRequired; } },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Completed"],
        default: "Pending"
    },
    createdAt: { type: Date, default: Date.now },
});

const eventCaseModel = mongoose.models.EventCase || mongoose.model("EventCase", eventCaseSchema);
export default eventCaseModel;

