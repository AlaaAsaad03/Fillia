import foodModel from "../models/foodModel.js";
import fs from 'fs';
import subCategoryModel from '../models/subCategoryModel.js';

// Add food item
const addFood = async (req, res) => {
    const { name, description, price, subcategoryId } = req.body; // Ensure the variable is consistent

    try {
        const image_filename = req.file ? req.file.filename : null;

        // Validate input
        if (!name || !description || !price || !subcategoryId) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if the subcategory exists
        const subCategory = await subCategoryModel.findById(subcategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        // Create a new food item
        const newFood = new foodModel({
            name,
            description,
            price,
            image: image_filename,
            subcategory: subcategoryId,
            quantity: 5,
        });

        // Save the food item
        const savedFood = await newFood.save();

        // Add the food item to the subcategory
        subCategory.food.push(savedFood._id);
        await subCategory.save();

        res.status(200).json({ success: true, message: "Food item added successfully", data: savedFood });
    } catch (error) {
        console.error("Error saving food item:", error);
        res.status(500).json({ success: false, message: "Failed to save food item", error });
    }
};

//Display Food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find().populate('subcategory'); // Populate subcategory details
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to retrieve food items" });
    }
};

//Remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id)
        fs.unlink(`uploads/${food.image}`, () => { })
        await foodModel.findByIdAndDelete(req.body.id)
        // Remove the food ID from the corresponding subcategory
        await subCategoryModel.findByIdAndUpdate(food.subcategory, {
            $pull: { food: req.body.id },
        });
        res.json({ success: true, message: "food removed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "error" })
    }
}

/*
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (food) {
            fs.unlink(`uploads/${food.image}`, () => {});
            await foodModel.findByIdAndDelete(req.body.id);
            res.json({ success: true, message: "Food Removed" });
        } else {
            res.status(404).json({ success: false, message: "Food item not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error removing food" });
    }
};
*/


// Update food item
const updateFood = async (req, res) => {
    try {
        const foodId = req.body.id;
        const existingFood = await foodModel.findById(foodId);

        if (!existingFood) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        // Update fields
        const updates = {
            name: req.body.name || existingFood.name,
            description: req.body.description || existingFood.description,
            price: req.body.price || existingFood.price,
            category: req.body.category || existingFood.category,
        };

        // Handle image update
        if (req.file) {
            fs.unlink(`uploads/${existingFood.image}`, () => { }); // Remove old image
            updates.image = req.file.filename; // Save new image filename
        }

        const updatedFood = await foodModel.findByIdAndUpdate(foodId, updates, { new: true });
        res.json({ success: true, message: "Food updated successfully", data: updatedFood });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating food" });
    }
};


// Search food items by name
const searchFood = async (req, res) => {
    const { name } = req.query;

    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: "Search term is required" });
    }

    try {
        console.log("Search Query:", name); // Log the search query
        const foods = await foodModel.find({
            name: { $regex: name, $options: "i" } // Case-insensitive search
        });
        console.log("Matched Foods:", foods); // Log matched foods

        if (foods.length === 0) {
            return res.status(404).json({ success: false, message: "No items found" });
        }

        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ success: false, message: "Error during search", error: error.message });
    }
};


export { addFood, listFood, removeFood, updateFood, searchFood }