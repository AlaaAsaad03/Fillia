import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  prehelper: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  orderId: [{ type: mongoose.Schema.Types.ObjectId, ref: "order" }],
  dateCreated: { type: Date, default: Date.now },
  availability: { type: String, enum: ["available", "not available"], default: "available" },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, enum: ["processing", "packing", "out for delivery", "delivered"], default: "processing" },
  userVerification: { type: String, enum: ["Delivered", "Not Delivered"], default: "Not Delivered" },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  itemsNeeded: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
      name: { type: String, required: true },
      isDonated: { type: Boolean, default: false },
      prehelperId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
      price: { type: Number },
    },
  ],
  salary: { type: Number, required: true },
  salaryImage: { type: String, required: false },
  status: { type: String, enum: ["done", "processing"], default: "processing" },
  acceptanceStatus: { type: String, enum: ["accepted", "rejected", "loading", "waiting"], default: "loading" },
  dateDelivered: { type: Date },
  targetGroup: { type: String, enum: ["children", "elderly", "families", "individuals"], required: true },
  budgetNeeded: { type: Number, required: true },
  notInterestedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\+961\d{7,8}$/, "Please provide a valid Lebanese phone number"],
  },
  deliveriedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  packagedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  urgency: { type: String, enum: ["low", "medium", "high"] },
  creatorReputationScore: { type: Number, default: 0 },
  caseType: { type: String, enum: ["medical", "food", "housing", "education"] },
  caseTypeImage: { type: String, required: false },
  salaryImageValidation: { type: String, enum: ["Valid", "Not Valid"], default: null },
  caseTypeImageValidation: { type: String, enum: ["Valid", "Not Valid"], default: null },
  AiLabel: { type: String, enum: ["trusted", "manual_review", "untrusted"], default: null },
  deadline: {
    type: Date,
    default: null, // Allows "no specific date" option
  },
});

const caseModel = mongoose.models.case || mongoose.model("case", caseSchema);
export default caseModel

