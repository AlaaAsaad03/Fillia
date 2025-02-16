import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["Available", "Unavailable", "Sold Out"], default: "Available" },
    createdAt: { type: Date, default: Date.now },

})

const foodModel = mongoose.model.food || mongoose.model("food", foodSchema);


// async function updateCreatedAtForExistingItems() {
//     try {
//         const foods = await foodModel.find(); // Fetch all food items
//         const updatePromises = foods.map(food => {
//             // Generate a random date within the last 2 years
//             const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
//             const randomDate = new Date(twoYearsAgo.getTime() + Math.random() * (Date.now() - twoYearsAgo.getTime()));
//             return foodModel.updateOne({ _id: food._id }, { createdAt: randomDate });
//         });

//         await Promise.all(updatePromises); // Execute all updates
//         console.log("Updated createdAt for all food items.");
//     } catch (error) {
//         console.error("Error updating createdAt:", error);
//     }
// }

// // Call the function to update the createdAt fields
// updateCreatedAtForExistingItems();

export default foodModel;