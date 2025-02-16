import orderModel from "../models/orderModel.js";
import Case from "../models/caseModel.js";
import mongoose from 'mongoose';

// Order Category Breakdown
const orderCategoryBreakdown = async (req, res) => {
    try {
        const data = await orderModel.aggregate([
            { $unwind: "$items" }, // Decompose the items array
            {
                $group: {
                    _id: "$items.subcategory",
                    totalAmount: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $project: { subcategory: "$_id", totalAmount: 1, _id: 0 } }
        ]);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching category breakdown" });
    }
};

// Weekly Spending Pattern
const weeklySpendingPattern = async (req, res) => {
    try {
        const data = await orderModel.aggregate([
            {
                $group: {
                    _id: { day: { $dayOfWeek: "$date" } },
                    totalAmount: { $sum: "$amount" },
                },
            },
            {
                $project: {
                    day: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id.day", 1] }, then: "Sunday" },
                                { case: { $eq: ["$_id.day", 2] }, then: "Monday" },
                                { case: { $eq: ["$_id.day", 3] }, then: "Tuesday" },
                                { case: { $eq: ["$_id.day", 4] }, then: "Wednesday" },
                                { case: { $eq: ["$_id.day", 5] }, then: "Thursday" },
                                { case: { $eq: ["$_id.day", 6] }, then: "Friday" },
                                { case: { $eq: ["$_id.day", 7] }, then: "Saturday" },
                            ],
                            default: "Unknown",
                        },
                    },
                    totalAmount: 1,
                },
            },
            { $sort: { day: 1 } },
        ]);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching weekly spending pattern" });
    }
};

// User vs Average Spending
const userVsAverageSpending = async (req, res) => {
    const { userId } = req.body;

    try {
        // Calculate user-specific spending
        const userSpending = await orderModel.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
            { $project: { _id: 0, totalSpent: 1 } }
        ]);

        // Calculate average spending across all users
        const averageSpending = await orderModel.aggregate([
            { $group: { _id: "$userId", totalSpent: { $sum: "$amount" } } },
            { $group: { _id: null, averageSpent: { $avg: "$totalSpent" } } },
            { $project: { _id: 0, averageSpent: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                userSpending: userSpending[0]?.totalSpent || 0,
                averageSpending: averageSpending[0]?.averageSpent || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching user vs average spending" });
    }
};

const casesHelpedPerDay = async (req, res) => {
    const { userId } = req.body;
    console.log("helperId:", userId); // Log incoming userId

    // Ensure userId is an ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId); // Use 'new' keyword

    try {
        const data = await Case.aggregate([
            {
                $match: {
                    helperId: userObjectId, // Use the ObjectId here
                    status: "done"
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$dateCreated" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        console.log("Aggregation result:", data); // Log the result of aggregation

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching cases helped per day:", error);
        res.json({ success: false, message: "Error fetching cases helped per day" });
    }
};


const getUserHelpStatistics = async (req, res) => {
    try {
        const userId = req.body.userId;

        const cases = await Case.aggregate([
            {
                $match: { helperId: { $ne: new mongoose.Types.ObjectId(userId) } }, // Cases where helperId is not the user
            },
            {
                $project: {
                    itemsNeeded: {
                        $filter: {
                            input: "$itemsNeeded",
                            as: "item",
                            cond: { $eq: ["$$item.prehelperId", new mongoose.Types.ObjectId(userId)] },
                        },
                    },
                },
            },
            {
                $unwind: "$itemsNeeded", // Flatten the itemsNeeded array
            },
            {
                $group: {
                    _id: null,
                    totalHelpedItems: { $sum: 1 }, // Count the number of matching items
                },
            },
        ]);

        const totalHelpedItems = cases.length > 0 ? cases[0].totalHelpedItems : 0;

        res.status(200).json({
            success: true,
            userId,
            totalHelpedItems,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user help statistics",
            error: error.message,
        });
    }
};

export { orderCategoryBreakdown, weeklySpendingPattern, userVsAverageSpending, casesHelpedPerDay, getUserHelpStatistics };
