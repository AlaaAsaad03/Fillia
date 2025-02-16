import mongoose from "mongoose";


const TemporaryHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    caseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'case', required: true }], // Array of case IDs
    createdAt: { type: Date, default: Date.now },
});

const TemporaryHistoryModel = mongoose.models.TemporaryHistory || mongoose.model('TemporaryHistory', TemporaryHistorySchema);
export default TemporaryHistoryModel;
