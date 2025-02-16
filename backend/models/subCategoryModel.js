import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    food: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }] // Reference to Food

});


const subCategoryModel = mongoose.models.SubCategory || mongoose.model("SubCategory", subCategorySchema);
export default subCategoryModel;