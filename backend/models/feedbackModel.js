import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const feedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default feedbackModel;