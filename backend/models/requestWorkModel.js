import mongoose from "mongoose";

const requestWorkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        match: [/^\+961\d{7,8}$/, "Please provide a valid Lebanese phone number"],
    },
    role: { type: String, enum: ['Packager', 'Delivery'], required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

const requestWorkModel = mongoose.models.RequestWork || mongoose.model("RequestWork", requestWorkSchema);

export default requestWorkModel;

