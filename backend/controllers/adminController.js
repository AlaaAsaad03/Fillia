import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await adminModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve user data" });
    }
};

// Controller to fetch all admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.find({});
        const adminData = admins.map(admin => ({
            id: admin._id,
            name: admin.name,
            role: admin.role,
            photo: admin.image ? `http://localhost:4000/uploads/${admin.image}` : null,
        }));
        res.status(200).json({ success: true, data: adminData });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ success: false, message: "Failed to fetch admin data" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

export { getUserById, getAllAdmins, getAllUsers };