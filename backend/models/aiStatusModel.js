import mongoose from 'mongoose';

const aiStatusSchema = new mongoose.Schema({
    aiStatus: {
        type: String,
        enum: ['enable', 'disable'],
        default: 'disable',
        required: true,
    },
}, { timestamps: true });

const AIStatusModel = mongoose.models.AIStatus || mongoose.model('AIStatus', aiStatusSchema);

export default AIStatusModel;