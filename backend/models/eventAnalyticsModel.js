import mongoose from "mongoose";

const eventAnalyticsSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, required: true, enum: ["Donation", "Items"] },
    totalDonations: { type: Number, default: 0 }, // Only for Donation events
    totalItemsSold: { type: Number, default: 0 }, // Only for Items events
    totalRevenue: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const eventAnalyticsModel =
    mongoose.models.EventAnalytics || mongoose.model("EventAnalytics", eventAnalyticsSchema);

export default eventAnalyticsModel;


