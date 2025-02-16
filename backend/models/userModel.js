import mongoose from "mongoose"

const userShcema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "food" },
        quantity: { type: Number, default: 1 }
    }],
    image: { type: String },
    role: { type: String, default: "user" },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now, },
    isVerified: { type: Boolean, default: false, },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    googleId: { type: String, unique: true, sparse: true },
    isFirstLogin: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },

}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userShcema);

export default userModel;