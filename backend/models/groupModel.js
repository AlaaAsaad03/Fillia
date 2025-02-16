import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    image: { type: String },
});

const groupModel = mongoose.models.Group || mongoose.model("Group", groupSchema);
export default groupModel;