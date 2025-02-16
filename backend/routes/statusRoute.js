import express from "express";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const statusRouter = express.Router();

// Get online status and last seen
statusRouter.get("/status/:id", async (req, res) => {
    const { id, role } = req.query;
    const model = role === "Leader" ? adminModel : userModel;

    try {
        const user = await model.findById(id, { isOnline: 1, lastSeen: 1 });
        if (!user) {
            return res.status(404).json({ success: false, message: "User/Admin not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching status" });
    }
});

export default statusRouter;