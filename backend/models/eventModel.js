import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["Donation", "Items"], required: true }, // Can include both types
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= new Date(); // Ensure start date is not in the past
            },
            message: "Start date cannot be in the past."
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.startDate; // Ensure end date is after the start date
            },
            message: "End date must be after the start date."
        }
    },
    status: { type: String, enum: ["Scheduled", "Ongoing", "Completed"], default: "Scheduled" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    createdAt: { type: Date, default: Date.now },
});

const eventModel = mongoose.models.Event || mongoose.model("Event", eventSchema);
export default eventModel;
