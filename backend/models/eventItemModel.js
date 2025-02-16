import mongoose from "mongoose";

const eventItemSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    createrId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    createrPhone: { type: String, required: true },
    createrLocation: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, default: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Claimed"],
        default: "Pending"
    },
    buyers: [
        {
            buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
            buyerPhone: { type: String, required: true },
            buyerLocation: { type: String, required: true },
            quantity: { type: Number, required: true },
            purchasedAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

const eventItemModel = mongoose.models.EventItem || mongoose.model("EventItem", eventItemSchema);
export default eventItemModel;