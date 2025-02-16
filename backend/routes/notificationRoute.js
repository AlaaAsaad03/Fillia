import express from "express";
import { getNotifications, markNotificationsAsViewed, createNotification } from "../controllers/notificationController.js"
import { authMiddleware } from "../middleware/auth.js";

const notificationRouter = express.Router();

notificationRouter.post("/get", authMiddleware, getNotifications); // Get notifications for admin
notificationRouter.post("/mark-as-viewed", authMiddleware, markNotificationsAsViewed); // Mark notifications as viewed
notificationRouter.post("/add", authMiddleware, createNotification)
export default notificationRouter;