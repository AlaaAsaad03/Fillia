import categoryModel from '../models/categoryModel.js';
import subCategoryModel from '../models/subCategoryModel.js';
import foodModel from '../models/foodModel.js';
import fs from 'fs';

//CATEGORY CONTROLLER FUNCTIONS: 

//Add a new category 
const addCategory = async (req, res) => {
    let image_filename = `${req.file.filename}`; // Store the name of the uploaded file 
    try {
        const { name } = req.body;
        // Check if the category already exists
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category with this name already exists." });
        }
        const newCategory = new categoryModel({
            name: req.body.name,
            image: image_filename,
        });
        await newCategory.save();
        res.status(200).json({ success: true, message: "Category added successfully", data: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding category", error });
    }
}


// List all categories
const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find(); // Fetch all categories
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve categories", error });
    }
};


//delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Remove all associated subcategories
        const category = await categoryModel.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        await subCategoryModel.deleteMany({ category: id });

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting category", error });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        let updateData = { name };

        if (req.file) {
            updateData.image = req.file.filename; // Handle image upload
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating category", error });
    }
};

// Update SubCategory
const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId } = req.body;
        let updateData = { name, category: categoryId };

        if (req.file) {
            updateData.image = req.file.filename; // Handle image upload
        }

        const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        res.status(200).json({ success: true, message: "Subcategory updated successfully", data: updatedSubCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating subcategory", error });
    }
};



//SUBCATEGORY CONTROLLER FUNCTIONS:

//add a new sub-category
const addSubCategory = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    try {
        const { name, categoryId } = req.body;

        // Check if the subcategory already exists in the specified category
        const existingSubCategory = await subCategoryModel.findOne({ name, category: categoryId });
        if (existingSubCategory) {
            return res.status(400).json({ success: false, message: "Subcategory with this name already exists in the specified category." });
        }
        const newSubCategory = new subCategoryModel({
            name: name,
            image: image_filename,
            category: categoryId // Ensure this is an ObjectId reference to the Category
        });

        await newSubCategory.save();

        // Add the subcategory to the category as well
        await categoryModel.findByIdAndUpdate(categoryId, {
            $push: { subcategories: newSubCategory._id }
        });

        res.status(200).json({ success: true, message: "Sub-category added successfully", data: newSubCategory });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding sub-category", error });
    }
}



//delete subcategory
const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the subcategory
        const subCategory = await subCategoryModel.findByIdAndDelete(id);

        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        // Remove the subcategory reference from the parent category
        await categoryModel.findByIdAndUpdate(subCategory.category, {
            $pull: { subcategories: id }
        });

        res.status(200).json({ success: true, message: "Subcategory deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting subcategory", error });
    }
};


// List subcategories for a specific category
const listSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find({ category: req.params.categoryId }); // Fetch subcategories by categoryId
        res.status(200).json({ success: true, data: subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve subcategories", error });
    }
};

//list all subcategories regardless of category
const listAllSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel
            .find()
            .populate('category', 'name'); // Populate category name only

        res.status(200).json({ success: true, data: subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve all subcategories", error });
    }
};


// List all items under a specific subcategory
const listItemsBySubcategory = async (req, res) => {
    const { subcategoryId } = req.params;

    try {
        const foods = await foodModel.find({ subcategory: subcategoryId }).populate('subcategory', 'name');

        if (!foods.length) {
            return res.status(404).json({ success: false, message: "No items found for this subcategory" });
        }

        res.status(200).json({ success: true, data: foods });
    } catch (error) {
        console.error("Error retrieving items:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve items", error });
    }
};



export {
    addCategory, updateCategory, deleteCategory, listCategories, addSubCategory, listSubCategories, listItemsBySubcategory, listAllSubCategories, updateSubCategory,
    deleteSubCategory
};
