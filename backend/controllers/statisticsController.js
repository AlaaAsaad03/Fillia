import Case from "../models/caseModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import mongoose from "mongoose";

// 1. Bar graph: Cases helped by each user
// export const casesHelpedByUser = async (req, res) => {
//     try {
//         const results = await Case.aggregate([
//             { $match: { status: "done" } },
//             { $group: { _id: "$helperId", count: { $sum: 1 } } },
//             { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
//             { $project: { user: { $arrayElemAt: ["$user.name", 0] }, count: 1 } }
//         ]);

//         res.status(200).json({ message: "Cases helped by user", data: results });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching data", error: error.message });
//     }
// };

export const casesHelpedByUser = async (req, res) => {
    try {
        const results = await Case.aggregate([
            {
                $unwind: "$itemsNeeded", // Unwind the `itemsNeeded` array to process `prehelperId`
            },
            {
                $match: {
                    "itemsNeeded.prehelperId": { $ne: null }, // Ensure `prehelperId` is not null
                    status: "done", // Include only completed cases
                },
            },
            {
                $group: {
                    _id: "$itemsNeeded.prehelperId", // Group by `prehelperId`
                    totalCasesHelped: { $sum: 1 }, // Count the number of cases helped
                },
            },
            {
                $lookup: {
                    from: "users", // Lookup user details
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $project: {
                    user: { $arrayElemAt: ["$user.name", 0] }, // Extract the user's name
                    profileImage: { $arrayElemAt: ["$user.image", 0] }, // Extract the user's profile image
                    totalCasesHelped: 1, // Include the total count
                },
            },

            {
                $sort: { totalCasesHelped: -1 }, // Sort by the number of cases helped in descending order
            },
            {
                $limit: 10, // Limit the results to the top 10 users
            },
        ]);

        res.status(200).json({ message: "Top 10 users who helped the most cases", data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};



// 2. Cases delivered per day
export const casesDeliveredPerDay = async (req, res) => {
    try {
        const results = await Case.aggregate([
            { $match: { level: "delivered", userVerification: "Delivered" } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateDelivered" } }, count: { $sum: 1 } } }
        ]);

        res.status(200).json({ message: "Cases delivered per day", data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

// 3. Daily Donation line graph
export const revenuePerDay = async (req, res) => {
    try {
        const results = await Order.aggregate([
            { $match: { payment: true } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, totalAmount: { $sum: "$amount" } } }
        ]);

        res.status(200).json({ message: "Donation per day", data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

// 4. Pie graph for case acceptance status
export const caseAcceptanceStatus = async (req, res) => {
    try {
        const results = await Case.aggregate([
            { $group: { _id: "$acceptanceStatus", count: { $sum: 1 } } }
        ]);

        res.status(200).json({ message: "Case acceptance status", data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

// 5. Count of registered users
export const countRegisteredUsers = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ message: "Total registered users", count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

// 6. Daily case creation count
export const dailyCaseCreation = async (req, res) => {
    try {
        const results = await Case.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateCreated" } }, count: { $sum: 1 } } }
        ]);

        res.status(200).json({ message: "Daily case creation", data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

// 7. Total revenue from all orders
export const totalRevenue = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        // Today's revenue
        const todayRevenue = await Order.aggregate([
            { $match: { payment: true, date: { $gte: startOfToday } } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        // Yesterday's revenue
        const yesterdayRevenue = await Order.aggregate([
            { $match: { payment: true, date: { $gte: startOfYesterday, $lt: startOfToday } } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        const todayTotal = todayRevenue[0]?.totalAmount || 0;
        const yesterdayTotal = yesterdayRevenue[0]?.totalAmount || 0;

        // Determine gain or loss
        const difference = todayTotal - yesterdayTotal;
        const status = difference > 0 ? "gain" : difference < 0 ? "loss" : "no change";

        res.status(200).json({
            message: "Total revenue",
            totalAmount: todayTotal,
            yesterdayTotal,
            difference,
            status
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

// 8. Most ordered items
export const mostOrderedItems = async (req, res) => {
    try {
        const results = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.name", totalOrdered: { $sum: "$items.quantity" } } },
            { $sort: { totalOrdered: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({ message: "Most ordered items", data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

//9. Get the count of cases that are helped with level "delivered" and userVerification "Delivered"
export const countHelpedCases = async (req, res) => {
    try {
        const totalCases = await Case.countDocuments({
            level: "delivered",
            userVerification: "Delivered",
        });

        res.status(200).json({ message: "Total helped cases retrieved successfully", totalCases });
    } catch (error) {
        console.error("Error fetching helped cases count:", error);
        res.status(500).json({ message: "Error fetching helped cases count", error: error.message });
    }
};


export const getAdminStatistics = async (req, res) => {
    try {
        const statistics = await Admin.aggregate([
            {
                $lookup: {
                    from: "cases",
                    localField: "_id",
                    foreignField: "packagedBy",
                    as: "packagedCases",
                },
            },
            {
                $lookup: {
                    from: "cases",
                    localField: "_id",
                    foreignField: "deliveriedBy",
                    as: "deliveredCases",
                },
            },
            {
                $project: {
                    name: 1,
                    role: 1,
                    packagedCasesCount: { $size: "$packagedCases" },
                    deliveredCasesCount: { $size: "$deliveredCases" },
                },
            },
            { $match: { role: { $in: ["Packager", "Delivery"] } } },
        ]);

        res.status(200).json({
            success: true,
            statistics,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching statistics",
            error: error.message,
        });
    }
};






