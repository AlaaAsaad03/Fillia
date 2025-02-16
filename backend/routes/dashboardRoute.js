import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    orderCategoryBreakdown, weeklySpendingPattern,
    userVsAverageSpending, casesHelpedPerDay, getUserHelpStatistics
} from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/order-category-breakdown", authMiddleware, orderCategoryBreakdown);
dashboardRouter.get("/weekly-spending-pattern", authMiddleware, weeklySpendingPattern);
dashboardRouter.post("/user-vs-average-spending", authMiddleware, userVsAverageSpending);
dashboardRouter.post("/cases-helped-per-day", authMiddleware, casesHelpedPerDay); // New route
dashboardRouter.get("/help", authMiddleware, getUserHelpStatistics);
export default dashboardRouter;
