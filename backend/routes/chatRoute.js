import express from "express";
import { sendMessage, getMessages, markAsRead, getGroupMessages, addUserToGroup } from "../controllers/chatController.js";
import { authMiddleware, authorizationMiddleware } from "../middleware/auth.js";
import messageModel from "../models/messageModel.js";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";
import groupModel from "../models/groupModel.js";
import { io } from "../server.js";
import multer from "multer";


const chatRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads", // Folder to save the uploaded images
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});

const upload = multer({ storage: storage });

// Send a message
chatRouter.post("/send", authMiddleware, sendMessage);

// Fetch messages between two users
chatRouter.get("/messages", authMiddleware, getMessages);

chatRouter.get("/messages-group", authMiddleware, getGroupMessages);

chatRouter.post("/addUserToGroup", addUserToGroup);

// Mark a message as read
chatRouter.patch("/read", authMiddleware, (req, res) => markAsRead(req, res, io));

chatRouter.get("/search", authMiddleware, async (req, res) => {
    const { userId } = req.body;
    const { query } = req.query;

    try {
        const messages = await messageModel.find({
            $and: [
                { $or: [{ sender: userId }, { receiver: userId }] },
                { content: { $regex: query, $options: "i" } },
            ],
        });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to search messages" });
    }
});

// Request chat from user to admin
chatRouter.post("/request", authMiddleware, async (req, res) => {
    const { adminId } = req.body; // userId is retrieved from the middleware

    // Check if adminId is provided
    if (!adminId) {
        return res.status(400).json({ success: false, message: "Admin ID is required" });
    }

    try {
        // Create a new chat request
        const chatRequest = new ChatRequest({
            adminId,
            userId: req.userId, // Get userId from the authenticated user
        });

        // Save the chat request to the database
        await chatRequest.save();

        // Logic for notifying the admin can be added here (e.g., using socket.io)

        return res.status(200).json({ success: true, message: "Chat request sent" });
    } catch (error) {
        console.error("Error sending chat request:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Fetch all users
chatRouter.get("/users", authMiddleware, async (req, res) => {
    try {
        const users = await userModel.find({});
        console.log("admins", users);
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
});

// Fetch all admins with role "Leader"
chatRouter.get("/admins", authMiddleware, async (req, res) => {
    try {
        const admins = await adminModel.find({ role: "Leader" });
        console.log("admins", admins);
        res.status(200).json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch admins" });
    }
});

chatRouter.get("/status/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await adminModel.findById(id, { isOnline: 1, lastSeen: 1 });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching status" });
    }
});

chatRouter.get("/status-user/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userModel.findById(id, { isOnline: 1, lastSeen: 1 });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching status" });
    }
});

chatRouter.post("/create-group", authMiddleware, authorizationMiddleware(["Leader"]), upload.single("image"), async (req, res) => {
    const { name } = req.body;
    const members = JSON.parse(req.body.members); // Parse members array
    const { createdBy } = req.body;
    const image = req.file?.path;

    console.log("Admin ID:", createdBy); // Debugging log

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Group name and members are required.",
        });
    }
    try {
        // Validate members
        const validMembers = await userModel.find({ _id: { $in: members } });
        if (validMembers.length !== members.length) {
            return res.status(400).json({ success: false, message: "Invalid members" });
        }

        // Create group
        const group = new groupModel({ name, members, createdBy, image });
        await group.save();

        res.status(201).json({
            success: true,
            message: "Group created successfully.",
            group,
        });
    } catch (error) {
        console.error("Error Creatin Group: ", error); // Log error details
        res.status(500).json({ success: false, message: "Failed to create group" });
    }
});

chatRouter.get("/groups", authMiddleware, async (req, res) => {
    try {
        const groups = await groupModel.find().populate("members", "name _id");
        console.log("Fetched groups:", groups); // Log fetched groups
        res.status(200).json({ success: true, groups });
    } catch (error) {
        console.error("Error fetching groups:", error); // Log error details
        res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }
});

chatRouter.get("/groups-user", authMiddleware, async (req, res) => {
    const userId = req.body.userId; // Get the authenticated user's ID
    try {
        const groups = await groupModel
            .find({ members: userId }) // Fetch only groups where the user is a member
            .populate("members", "name _id")
            .populate("createdBy", "name _id"); // Include group creator details

        res.status(200).json({ success: true, groups });
        console.log("grp", groups)
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }
});

chatRouter.get("/non-group-users/:groupId", async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await groupModel.findById(groupId).populate("members");
        if (!group) return res.status(404).json({ success: false, message: "Group not found" });

        const groupMemberIds = group.members.map((member) => member._id.toString());
        const nonGroupUsers = await userModel.find({ _id: { $nin: groupMemberIds } });

        res.status(200).json({ success: true, users: nonGroupUsers });
    } catch (error) {
        console.error("Error fetching non-group users:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



export default chatRouter;