import mongoose from "mongoose";
const eventDonationSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "EventCase", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    amount: { type: Number, required: true },
    donatedAt: { type: Date, default: Date.now },
});

const eventDonationModel = mongoose.models.EventDonation || mongoose.model("EventDonation", eventDonationSchema);
export default eventDonationModel;