import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, ref: "user", required: true },
    items: [{
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
        quantity: { type: Number, required: true }
    }],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food processing" },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    matched: { type: Boolean, default: false },
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;