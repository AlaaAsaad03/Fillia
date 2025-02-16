import suggestionModel from "../models/suggestionModel.js";
import foodModel from "../models/foodModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const suggestFood = async (req, res) => {
    const { name, description, price, quantity, subcategoryId } = req.body;
    const userId = req.body.userId;
    let image_filename = `${req.file.filename}`;

    console.log('Request Body:', req.body); // Debugging
    console.log('Uploaded File:', req.file); // Debugging

    if (!name || !description || !price || !quantity || !subcategoryId || !userId) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }


    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        const newSuggestion = new suggestionModel({
            name,
            description,
            price,
            quantity,
            image: image_filename,
            subcategory: subcategoryId,
            userId: userId,
        });

        const savedSuggestion = await newSuggestion.save();

        // Notify only admins with the role "Leader"
        const leaders = await adminModel.find({ role: "Leader" });
        const notifications = leaders.map((leader) => ({
            sender: userId,
            senderModel: "user",
            receiver: leader._id,
            receiverModel: "Admin",
            message: `New item ${name} is sent by the user ${user.name}`,
        }));

        await notificationModel.insertMany(notifications);

        res.status(200).json({
            success: true,
            message: "Suggestion submitted successfully",
            data: savedSuggestion,
        });
    } catch (error) {
        console.error("Error saving suggestion:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit suggestion",
            error: error.message,
        });
    }
};

// Update suggestion status (for admin)
const updateSuggestionStatus = async (req, res) => {
    const { suggestionId, status } = req.body;
    const adminId = req.body.userId
    console.log(adminId)

    try {
        const suggestion = await suggestionModel
            .findById(suggestionId)
            .populate("userId");
        if (!suggestion) {
            return res.status(404).json({ message: "Suggestion not found" });
        }

        suggestion.status = status;
        await suggestion.save();

        // Notify the user
        const message =
            status === "accepted"
                ? `Your item ${suggestion.name} was accepted. Please contact the admin for more details.`
                : `Your item ${suggestion.name} was rejected.`;

        await notificationModel.create({
            sender: adminId, // Admin ID
            senderModel: "Admin",
            receiver: suggestion.userId._id,
            receiverModel: "user",
            message,
        });

        if (status === "accepted") {
            if (!suggestion.image) {
                return res
                    .status(400)
                    .json({ message: "Image is required to create a food item" });
            }

            await foodModel.create({
                name: suggestion.name,
                description: suggestion.description,
                price: suggestion.price,
                image: suggestion.image,
                quantity: suggestion.quantity,
                subcategory: suggestion.subcategory,
            });
        }

        res.json({ message: "Suggestion status updated successfully" });
    } catch (err) {
        console.error("Error updating suggestion status:", err);
        res
            .status(500)
            .json({ message: "Failed to update status", error: err.message });
    }
};

// List suggestions (for admin)
const listSuggestions = async (req, res) => {
    try {
        const suggestions = await suggestionModel
            .find()
            .populate("subcategory userId");
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, message: "Failed to retrieve suggestions" });
    }
};

const deleteSuggestion = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedSuggestion = await suggestionModel.findByIdAndDelete(id);
        if (!deletedSuggestion) {
            return res.status(404).json({ success: false, message: "Suggestion not found" });
        }
        res.json({ success: true, message: "Suggestion deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete suggestion" });
    }
};

const getUserSuggestions = async (req, res) => {
    try {
        const userId = req.body.userId;
        const suggestions = await suggestionModel.find({ userId }).populate('subcategory');
        res.status(200).json({ success: true, suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch user suggestions" });
    }
};


export { suggestFood, updateSuggestionStatus, listSuggestions, deleteSuggestion, getUserSuggestions };

