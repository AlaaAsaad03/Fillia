import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    image: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to the user who suggested
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const suggestionModel = mongoose.models.Suggestion || mongoose.model("Suggestion", suggestionSchema);

export default suggestionModel;
