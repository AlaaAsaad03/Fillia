import userModel from "../models/userModel.js";
import fs from "fs";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get Profile
const getProfile = async (req, res) => {
    const { userId } = req.body;
    if (!isValidObjectId(userId)) {
        return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    try {
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching profile" });
    }
};

const getProfileForAdmin = async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    try {
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching profile" });
    }
};
// Update Profile
const updateProfile = async (req, res) => {
    const { userId, name, email, password } = req.body;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    try {
        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updates = {
            name: name || existingUser.name,
            email: email || existingUser.email,
            password: password ? await bcrypt.hash(password, 10) : existingUser.password,
        };

        if (req.file) {
            if (existingUser.image) {
                fs.unlink(`uploads/${existingUser.image}`, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            updates.image = req.file.filename;
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updates, { new: true });
        res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

// Delete Account
const deleteAccount = async (req, res) => {
    const { userId } = req.body;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    try {
        const user = await userModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ success: false, message: "Error deleting account" });
    }
};

export { getProfile, updateProfile, deleteAccount, getProfileForAdmin }