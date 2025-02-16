import Event from "../models/eventModel.js";
import Stripe from "stripe";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import EventCase from "../models/eventCaseModel.js";
import EventItem from "../models/eventItemModel.js";
import eventDonationModel from "../models/eventDonationModel .js";
import EventAnalytic from "../models/eventAnalyticsModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontend_url = "http://localhost:5173";

// schedule an event
export const scheduleEvent = async (req, res) => {
    try {
        const userId = req.body.userId;
        const role = req.body.role;
        const { title, description, type, startDate, endDate } = req.body;

        // Validate userId and role
        if (!userId || !role) {
            return res
                .status(400)
                .json({ message: "User ID and role are required." });
        }

        // Verify the admin role
        if (role !== "Leader") {
            return res
                .status(403)
                .json({ message: "Access denied. Only Leaders can schedule events." });
        }

        // Check for existing scheduled or ongoing events
        const existingEvent = await Event.findOne({
            status: { $in: ["Scheduled", "Ongoing"] },
        });

        if (existingEvent) {
            return res.status(400).json({
                message: `Cannot schedule a new event. There is already an event with status: "${existingEvent.status}".`,
            });
        }

        // Validate the dates
        const currentDate = new Date();
        if (new Date(startDate) < currentDate) {
            return res
                .status(400)
                .json({ message: "Start date cannot be in the past." });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return res
                .status(400)
                .json({ message: "End date must be after the start date." });
        }

        // Create the event
        const newEvent = new Event({
            title,
            description,
            type,
            startDate,
            endDate,
            status: "Scheduled",
            createdBy: userId,
        });

        await newEvent.save();

        // Notify all users about the event
        const allUsers = await User.find({}, "_id");
        const notifications = allUsers.map((user) => ({
            sender: userId,
            senderModel: "Admin",
            receiver: user._id,
            receiverModel: "user",
            message: `A new event "${title}" has been scheduled to start on ${new Date(
                startDate
            ).toLocaleString()}.`,
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            message:
                "Event scheduled successfully and notifications sent to all users.",
            event: newEvent,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error scheduling event", error: error.message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate("createdBy", "name email"); // Adjust populated fields
        res.status(200).json({
            success: true,
            message: "Events retrieved successfully.",
            data: events,
        });
    } catch (error) {
        console.error("Error fetching events:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve events. Please try again later.",
        });
    }
};

// user create a case
export const createCase = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { eventId, title, description, amountRequired } = req.body;
        console.log(req.body);
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        if (event.type !== "Donation") {
            return res.status(400).json({ message: "you cant send cases" });
        }

        // Check event status and start date
        const currentDate = new Date();
        if (event.startDate <= currentDate) {
            return res.status(400).json({
                message: "The event has already started. Cases cannot be added.",
            });
        }

        // Check if user has already created a case for this event
        const existingCase = await EventCase.findOne({ eventId, userId: userId });
        if (existingCase) {
            return res
                .status(400)
                .json({ message: "You have already created a case for this event." });
        }

        // Create a new case
        const newCase = new EventCase({
            eventId,
            userId: userId,
            title,
            description,
            amountRequired,
        });

        await newCase.save();

        res.status(201).json({
            message: "Case created successfully.",
            case: newCase,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error creating case", error: error.message });
    }
};

// user add item
export const addItem = async (req, res) => {
    console.log("Request body:", req.body);

    try {
        const userId = req.body.userId;
        const {
            eventId,
            createrPhone,
            createrLocation,
            name,
            description,
            quantity,
            price,
        } = req.body;
        let image_filename = `${req.file.filename}`;

        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        if (event.type !== "Items") {
            return res.status(400).json({ message: "you cant send items" });
        }

        // Ensure the event is still "Scheduled"
        if (event.status !== "Scheduled") {
            return res
                .status(400)
                .json({ message: "Items can only be added to scheduled events." });
        }

        // Create a new item
        const newItem = new EventItem({
            eventId,
            createrId: userId,
            createrPhone,
            createrLocation,
            name,
            description,
            quantity,
            price,
            image: image_filename,
        });

        await newItem.save();

        res.status(201).json({
            message: "Item added successfully.",
            item: newItem,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error adding item", error: error.message });
    }
};

// update the event status
export const updateEventStatuses = async (req, res) => {
    try {
        const now = new Date();

        // Update events where the start date is reached but not the end date
        const ongoingEvents = await Event.updateMany(
            { startDate: { $lte: now }, endDate: { $gt: now }, status: "Scheduled" },
            { $set: { status: "Ongoing" } }
        );

        // Update events where the end date is reached
        const completedEvents = await Event.updateMany(
            { endDate: { $lte: now }, status: { $ne: "Completed" } },
            { $set: { status: "Completed" } }
        );

        res.status(200).json({
            message: "Event statuses updated successfully.",
            updatedOngoingEvents: ongoingEvents.nModified,
            updatedCompletedEvents: completedEvents.nModified,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error updating event statuses", error: error.message });
    }
};

// Handle donation
export const donateToCase = async (req, res) => {
    const userId = req.body.userId;
    const { eventId, caseId, amount } = req.body;

    console.log("Received amount:", amount); // Check if this is a number


    try {
        // Validate input
        if (!eventId || !caseId || !userId || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid input parameters." });
        }

        // Fetch the case
        const eventCase = await EventCase.findById(caseId);
        if (!eventCase) {
            return res.status(404).json({ message: "Case not found." });
        }
        const event = await Event.findById(eventId);
        if (event.status !== "Ongoing") {
            return res.status(400).json({ message: "Event Ends" });
        }


        // Ensure amount is a number
        const donationAmount = Number(amount);
        // Check if the amount is within the remaining limit
        if (donationAmount > eventCase.remainingAmount) {
            return res
                .status(400)
                .json({ message: "Donation amount exceeds the remaining amount." });
        }

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Donation for ${eventCase.title}`,
                        },
                        unit_amount: amount * 100, // Stripe expects the amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${frontend_url}/donation-success?caseId=${caseId}&amount=${amount}&userId=${userId}&eventId=${eventId}`,
            cancel_url: `${frontend_url}/donation-cancel`,
        });

        // Send the session URL to the client
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error in donation:", error);
        res
            .status(500)
            .json({ message: "Internal server error.", error: error.message });
    }
};

// Handle successful donation callback
export const handleDonationSuccess = async (req, res) => {
    const { caseId, amount, userId, eventId } = req.query;

    const donationAmount = Number(amount);

    try {
        // Update the event case
        const eventCase = await EventCase.findById(caseId);
        if (!eventCase) {
            return res.status(404).json({ message: "Case not found." });
        }

        const event = await Event.findById(eventId);
        if (event.status !== "Ongoing") {
            return res.status(400).json({ message: "Event Ends" });
        }

        eventCase.remainingAmount -= donationAmount;
        eventCase.amountCollected += donationAmount;
        await eventCase.save();

        // Log the donation
        const donation = new eventDonationModel({
            eventId,
            caseId,
            userId,
            amount: donationAmount
        });
        await donation.save();

        res
            .status(200)
            .json({ message: "Donation successful and logged.", donation });
    } catch (error) {
        console.error("Error handling donation success:", error);
        res
            .status(500)
            .json({ message: "Internal server error.", error: error.message });
    }
};

export const buyItem = async (req, res) => {
    const userId = req.body.userId;
    const { itemId, buyerPhone, buyerLocation, quantity } = req.body;

    try {
        // Find the item
        const item = await EventItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        const eventId = item.eventId;
        const event = await Event.findById(eventId);
        if (event.status !== "Ongoing") {
            return res.status(400).json({ message: "Event Ends" });
        }

        // Check if the item is available for purchase
        if (item.status !== "Approved") {
            return res
                .status(400)
                .json({ message: "Item is not available for purchase." });
        }

        // Check if the requested quantity is available
        if (quantity > item.quantity) {
            return res.status(400).json({
                message: `Requested quantity exceeds available stock. Available: ${item.quantity}`,
            });
        }

        // Calculate total price based on quantity
        const totalPrice = item.price * quantity;

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.name,
                            description: item.description,
                        },
                        unit_amount: totalPrice * 100, // Stripe expects price in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${frontend_url}/purchase-success?itemId=${itemId}`,
            cancel_url: `${frontend_url}/purchase-cancel`,
        });

        // Update item details
        item.quantity -= quantity; // Reduce available quantity
        item.buyers.push({
            buyerId: userId,
            buyerPhone,
            buyerLocation,
            quantity,
        });

        // If quantity becomes zero, mark the item as claimed
        if (item.quantity === 0) {
            item.status = "Claimed";
        }

        await item.save();

        // Send the session URL to the client
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error in purchase:", error);
        res
            .status(500)
            .json({ message: "Internal server error.", error: error.message });
    }
};

// Handle purchase success callback
export const handlePurchaseSuccess = async (req, res) => {
    const { itemId } = req.query;

    try {
        // Find the item
        const item = await EventItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        res.status(200).json({ message: "Purchase successful.", item });
    } catch (error) {
        console.error("Error handling purchase success:", error);
        res
            .status(500)
            .json({ message: "Internal server error.", error: error.message });
    }
};

// Generate Analytics for Completed Events
// export const generateEventAnalytics = async (req, res) => {
//   try {
//     const { eventId } = req.body;

//     // Find the completed event
//     const event = await Event.findById(eventId);
//     if (!event || event.status !== "Completed") {
//       return res
//         .status(400)
//         .json({ message: "Invalid or non-completed event." });
//     }

//     // Check if analytics already exist for this event
//     const existingAnalytics = await EventAnalytic.findOne({ eventId });
//     if (existingAnalytics) {
//       return res
//         .status(400)
//         .json({ message: "Analytics already generated for this event." });
//     }

//     // Initialize analytics object
//     const analytics = {
//       eventId: event._id,
//       type: event.type,
//     };

//     if (event.type === "Donation") {
//       // Calculate donation analytics
//       const totalDonations = await eventDonationModel.aggregate([
//         { $match: { eventId: event._id } },
//         { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
//       ]);

//       analytics.totalDonations =
//         totalDonations.length > 0 ? totalDonations[0].totalAmount : 0;
//       analytics.totalRevenue = analytics.totalDonations;

//       // Calculate total participants (unique donors)
//       const uniqueDonors = await eventDonationModel.distinct("userId", {
//         eventId: event._id,
//       });
//       analytics.totalParticipants = uniqueDonors.length;
//     } else if (event.type === "Items") {
//       // Calculate item sales analytics
//       const totalItemsSold = await EventItem.aggregate([
//         { $match: { eventId: event._id } }, // Match items for the specific event
//         { $unwind: "$buyers" }, // Unwind the buyers array
//         {
//           $group: {
//             _id: null,
//             totalSold: { $sum: "$buyers.quantity" }, // Sum the quantities bought by all buyers
//             totalRevenue: {
//               $sum: { $multiply: ["$buyers.quantity", "$price"] },
//             }, // Calculate total revenue
//           },
//         },
//       ]);

//       analytics.totalItemsSold =
//         totalItemsSold.length > 0 ? totalItemsSold[0].totalSold : 0;
//       analytics.totalRevenue =
//         totalItemsSold.length > 0 ? totalItemsSold[0].totalRevenue : 0;

//       // Calculate total participants (unique buyers)
//       const uniqueBuyers = await EventItem.aggregate([
//         { $match: { eventId: event._id } },
//         { $unwind: "$buyers" },
//         { $group: { _id: "$buyers.buyerId" } }, // Group by buyerId to find unique participants
//       ]);
//       analytics.totalParticipants = uniqueBuyers.length;
//     }

//     // Save analytics
//     const newAnalytics = new EventAnalytic(analytics);
//     await newAnalytics.save();

//     res.status(201).json({
//       message: "Event analytics generated successfully.",
//       analytics: newAnalytics,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error generating analytics", error: error.message });
//   }
// };

export const generateEventAnalytics = async (req, res) => {
    try {
        // Fetch all completed events
        const completedEvents = await Event.find({ status: "Completed" });

        if (completedEvents.length === 0) {
            return res.status(404).json({ message: "No completed events found." });
        }

        const analyticsResults = [];

        for (const event of completedEvents) {
            // Check if analytics already exist
            let existingAnalytics = await EventAnalytic.findOne({ eventId: event._id });

            if (existingAnalytics) {
                analyticsResults.push({
                    eventId: event._id,
                    title: event.title,
                    message: "Analytics already exist.",
                    analytics: existingAnalytics,
                });
                continue; // Skip generating analytics for this event
            }

            // Initialize analytics object
            const analytics = {
                eventId: event._id,
                type: event.type,
            };

            if (event.type === "Donation") {
                // Calculate donation analytics
                const totalDonations = await eventDonationModel.aggregate([
                    { $match: { eventId: event._id } },
                    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
                ]);

                analytics.totalDonations =
                    totalDonations.length > 0 ? totalDonations[0].totalAmount : 0;
                analytics.totalRevenue = analytics.totalDonations;

                // Calculate total cases where help was provided
                analytics.totalCases = await eventDonationModel.countDocuments({
                    eventId: event._id,
                });

                // Calculate total participants (unique donors)
                const uniqueDonors = await eventDonationModel.distinct("userId", {
                    eventId: event._id,
                });
                analytics.totalParticipants = uniqueDonors.length;
            } else if (event.type === "Items") {
                // Calculate item sales analytics
                const totalItemsSold = await EventItem.aggregate([
                    { $match: { eventId: event._id } },
                    { $unwind: "$buyers" },
                    {
                        $group: {
                            _id: null,
                            totalSold: { $sum: "$buyers.quantity" },
                            totalRevenue: { $sum: { $multiply: ["$buyers.quantity", "$price"] } },
                        },
                    },
                ]);

                analytics.totalItemsSold = totalItemsSold.length > 0 ? totalItemsSold[0].totalSold : 0;
                analytics.totalRevenue = totalItemsSold.length > 0 ? totalItemsSold[0].totalRevenue : 0;

                // Calculate total participants (unique buyers)
                const uniqueBuyers = await EventItem.aggregate([
                    { $match: { eventId: event._id } },
                    { $unwind: "$buyers" },
                    { $group: { _id: "$buyers.buyerId" } },
                ]);
                analytics.totalParticipants = uniqueBuyers.length;
            }

            // Save new analytics
            const newAnalytics = new EventAnalytic(analytics);
            await newAnalytics.save();

            // Include the event title in the response
            analyticsResults.push({
                eventId: event._id,
                title: event.title,
                message: "Analytics generated successfully.",
                analytics: newAnalytics,
            });
        }

        res.status(200).json({
            message: "Event analytics retrieved/generated successfully.",
            results: analyticsResults,
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating analytics", error: error.message });
    }
};

export const getScheduledEventsWithRequests = async (req, res) => {
    try {
        const events = await Event.find({ status: "Scheduled" });

        const results = await Promise.all(
            events.map(async (event) => {
                if (event.type === "Donation") {
                    const requests = await EventCase.find({
                        eventId: event._id,
                    }).populate("userId");
                    return { ...event.toObject(), requests };
                } else if (event.type === "Items") {
                    const requests = await EventItem.find({
                        eventId: event._id,
                    }).populate("createrId");
                    return { ...event.toObject(), requests };
                }
                return { ...event.toObject(), requests: [] };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error fetching scheduled events.", error });
    }
};

export const getEvent = async (req, res) => {
    try {
        const event = await Event.findOne({ status: { $ne: "Completed" } });
        if (!event) {
            return res.status(200).json({ redirect: "http://localhost:5173/no-events" });
        }
        res.status(200).json([event]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching scheduled events.", error });
    }
};
export const updateRequestStatus = async (req, res) => {
    console.log("Request body:", req.body);
    try {
        const { requestId, type, status } = req.body;

        if (
            !["Pending", "Approved", "Rejected", "Claimed", "Completed"].includes(
                status
            )
        ) {
            return res.status(400).json({ message: "Invalid status." });
        }

        if (type === "Donation") {
            const updatedRequest = await EventCase.findByIdAndUpdate(
                requestId,
                { status },
                { new: true }
            );
            if (!updatedRequest) {
                return res
                    .status(404)
                    .json({ message: "Request not found in Donations." });
            }
            return res
                .status(200)
                .json({ message: "Request status updated.", updatedRequest });
        } else if (type === "Items") {
            const updatedRequest = await EventItem.findByIdAndUpdate(
                requestId,
                { status },
                { new: true }
            );
            if (!updatedRequest) {
                return res.status(404).json({ message: "Request not found in Items." });
            }
            return res
                .status(200)
                .json({ message: "Request status updated.", updatedRequest });
        } else {
            return res.status(400).json({ message: "Invalid request type." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating request status.", error });
    }
};

export const getCompletedEvents = async (req, res) => {
    try {
        const completedEvents = await Event.find({ status: "Completed" });
        res.status(200).json(completedEvents);
    } catch (error) {
        console.error("Error fetching completed events:", error);
        res.status(500).json({ message: "Failed to fetch completed events" });
    }
};

export const getAllCases = async (req, res) => {
    try {
        // Find the event with status "Scheduled"
        const scheduledEvent = await Event.findOne({ status: "Ongoing" });

        if (!scheduledEvent) {
            return res.status(404).json({ message: "No scheduled event found." });
        }

        // Find cases with status "Approved" or "Completed" for the event
        const cases = await EventCase.find({
            eventId: scheduledEvent._id,
            status: { $in: ["Approved", "Completed"] },
        });

        res.status(200).json({
            event: scheduledEvent,
            cases,
        });
    } catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Error fetching cases.", error });
    }
}


export const getAllItems = async (req, res) => {
    try {
        // Find the event with status "Scheduled"
        const scheduledEvent = await Event.findOne({ status: "Ongoing" });

        if (!scheduledEvent) {
            return res.status(404).json({ message: "No scheduled event found." });
        }

        // Find items with status "Approved" or "Claimed" for the event
        const items = await EventItem.find({
            eventId: scheduledEvent._id,
            status: { $in: ["Approved", "Claimed"] },
        }).populate("createrId", "name image");;

        res.status(200).json({
            event: scheduledEvent,
            items,
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ message: "Error fetching items.", error });
    }
}