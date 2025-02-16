import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }] // Array of subcategory references
});



const categoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default categoryModel;