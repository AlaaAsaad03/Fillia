import notificationModel from "../models/notificationModel.js";

const getNotifications = async (req, res) => {
    const userId = req.body.userId; // Extract userId and role from the request
    const role = req.body.role;

    console.log(role)
    console.log(userId)

    try {
        // Determine the receiver model based on the role
        const receiverModel = role === "user" ? "user" : "Admin";

        // Fetch unseen notifications for the user or admin
        const notifications = await notificationModel
            .find({ receiver: userId, receiverModel, isViewed: false })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch notifications" });
    }
};

const markNotificationsAsViewed = async (req, res) => {
    const userId = req.body.userId; // Extract userId and role from the request
    const role = req.body.role;

    console.log(role)
    console.log(userId)

    try {
        // Determine the receiver model based on the role
        const receiverModel = role === "user" ? "user" : "Admin";

        // Mark all unseen notifications for the user or admin as viewed
        const result = await notificationModel.updateMany(
            { receiver: userId, receiverModel, isViewed: false },
            { isViewed: true }
        );

        res.status(200).json({
            success: true,
            message: "Notifications marked as viewed",
            updatedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error marking notifications as viewed:", error);
        res
            .status(500)
            .json({
                success: false,
                message: "Failed to mark notifications as viewed",
            });
    }
};

// Create Notification
const createNotification = async (req, res) => {
    const { sender, senderModel, receiver, receiverModel, message } = req.body;

    try {
        // Validate required fields
        if (!sender || !senderModel || !receiver || !receiverModel || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create the notification
        const newNotification = new notificationModel({
            sender,
            senderModel,
            receiver,
            receiverModel,
            message,
        });

        await newNotification.save();

        res.status(201).json({ success: true, message: "Notification created successfully", data: newNotification });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ success: false, message: "Failed to create notification" });
    }
};

export { getNotifications, markNotificationsAsViewed, createNotification };