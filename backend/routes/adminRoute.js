import express from "express";
import { getUserById, getAllAdmins, getAllUsers } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/auth.js";
import adminModel from "../models/adminModel.js";
import multer from 'multer'
import bcrypt from 'bcrypt';
import fs from "fs";
import axios from "axios";
import AIStatus from '../models/aiStatusModel.js'

const adminRouter = express.Router();


const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

adminRouter.get("/details", authMiddleware, async (req, res) => {
    try {
        const admin = await adminModel.findById(req.body.userId); // Ensure you're using req.body.userId
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const { name, email, role, image } = admin;
        const imageUrl = image ? `http://localhost:4000/uploads/${image}` : null; // Adjust path as needed
        res.json({
            success: true,
            admin: { name, email, role, image: imageUrl },
            message: 'Profile fetched successfully'
        });


    } catch (error) {
        console.error(error);  // Log the error for more detail
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
adminRouter.put('/update', authMiddleware, upload.single('image'), async (req, res) => {

    const { adminId } = req.query;

    try {
        const { name, email, password, role } = req.body;

        // Find admin by ID
        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        // Update fields if provided
        const updates = {
            name: name || admin.name,
            email: email || admin.email,
            password: password ? await bcrypt.hash(password, 10) : admin.password, // Note: Consider encrypting the password if it's new
        };

        if (role) admin.role = role;

        // Handle image upload or removal
        if (req.file) {
            // Delete old image if it exists
            if (admin.image) {
                fs.unlink(`uploads/${admin.image}`, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            updates.image = req.file.filename; // Update image with the new filename
        }

        const updatedAdmin = await adminModel.findByIdAndUpdate(adminId, updates, { new: true });

        return res.status(200).json({ success: true, message: "Admin updated successfully.", data: updatedAdmin });
    } catch (error) {
        console.error("Error updating admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});
adminRouter.delete("/remove-image", async (req, res) => {
    const { adminId } = req.body; // Assume adminId is passed in the body

    try {
        // Logic to remove the image
        // Update the database record to nullify the image field
        const result = await adminModel.findByIdAndUpdate(
            adminId,
            { image: null },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        res.status(200).json({ success: true, message: "Image removed successfully." });
    } catch (error) {
        console.error("Error removing image:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Fetch all admins
adminRouter.get('/all', getAllAdmins);
adminRouter.put('/update-role', authMiddleware, async (req, res) => {
    const { adminId, newRole } = req.body;

    try {
        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        admin.role = newRole;
        await admin.save();

        res.status(200).json({ success: true, message: "Role updated successfully.", data: admin });
    } catch (error) {
        console.error("Error updating role:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});

adminRouter.post('/add', authMiddleware, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new adminModel({ name, email, password: hashedPassword, role });
        await newAdmin.save();

        res.status(201).json({ success: true, message: "Admin added successfully.", data: newAdmin });
    } catch (error) {
        console.error("Error adding admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});
// Remove admin
adminRouter.delete('/remove/:adminId', authMiddleware, async (req, res) => {
    const { adminId } = req.params; // Get the adminId from the URL

    try {
        const admin = await adminModel.findByIdAndDelete(adminId); // Delete the admin

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        res.status(200).json({ success: true, message: "Admin removed successfully." });
    } catch (error) {
        console.error("Error removing admin:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});

adminRouter.post('/ai-status', async (req, res) => {
    const { aiStatus } = req.body;

    if (!['enable', 'disable'].includes(aiStatus)) {
        return res.status(400).json({ message: 'Invalid status. Use "enable" or "disable".' });
    }

    try {
        const status = await AIStatus.findOneAndUpdate({}, { aiStatus }, { upsert: true, new: true });

        if (aiStatus === 'enable') {
            // Call the validateImages endpoint
            try {
                const response = await axios.post(
                    'http://localhost:4000/api/validate/validateImages',
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
                console.log('Validation process started:', response.data);
            } catch (validationError) {
                console.error('Error starting validation process:', validationError.message);
                return res.status(500).json({
                    message: 'AI status updated, but validation process failed to start',
                    error: validationError.message,
                });
            }
        }
        res.status(200).json({ message: `AI status updated to ${aiStatus}`, status });
    } catch (error) {
        res.status(500).json({ message: 'Error updating AI status', error: error.message });
    }

});

adminRouter.get("/users/:id", authMiddleware, getUserById);

adminRouter.get("/users", authMiddleware, getAllUsers);




export default adminRouter;