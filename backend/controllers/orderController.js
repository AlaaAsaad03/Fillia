import { response } from "express";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Case from "../models/caseModel.js";
import adminModel from "../models/adminModel.js";
import notificationModel from "../models/notificationModel.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import foodModel from '../models/foodModel.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order from frontend
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items.map(item => ({
                foodId: item.foodId,
                quantity: item.quantity
            })),
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: [] });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Fee",
                },
                unit_amount: 2 * 100,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });
        res.json({ success: true, session_url: session.url });
        console.log(session.url);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const verifyOrder = async (req, res) => {
    try {
        const { orderId, success, userId } = req.body;
        // const { userId } = req.body.userId;

        console.log("userId:", userId);


        if (success === "true") {
            // Mark the order as paid
            await orderModel.findByIdAndUpdate(orderId, { payment: true });

            // Check if the userId exists in the `prehelper` array of any case
            const caseWithPrehelper = await Case.findOne({
                prehelper: { $in: [new mongoose.Types.ObjectId(userId)] },
            });
            console.log("lo");

            console.log("case:", caseWithPrehelper);


            if (caseWithPrehelper) {
                // UserId found in prehelper

                // Save the orderId in the case's `orderId` array
                caseWithPrehelper.orderId.push(orderId);
                console.log("first time");

                await caseWithPrehelper.save();

                // Find the order by orderId
                const order = await orderModel.findById(orderId);
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        message: "Order not found",
                    });
                }
                console.log("Order items:", order.items);
                console.log("Case itemsNeeded:", caseWithPrehelper.itemsNeeded);

                // Iterate through items in the order and mark them as donated if they exist in the case
                for (const orderItem of order.items) {
                    const itemIndex = caseWithPrehelper.itemsNeeded.findIndex(
                        (item) => item.id.toString() === orderItem.foodId.toString()
                    );

                    if (itemIndex !== -1) {
                        caseWithPrehelper.itemsNeeded[itemIndex].isDonated = true;
                        caseWithPrehelper.itemsNeeded[itemIndex].prehelperId = userId;

                        console.log("Item Price:", caseWithPrehelper.itemsNeeded[itemIndex].price);
                        if (caseWithPrehelper.itemsNeeded[itemIndex].price) {
                            caseWithPrehelper.budgetNeeded -= caseWithPrehelper.itemsNeeded[itemIndex].price;
                            if (caseWithPrehelper.budgetNeeded < 0) {
                                caseWithPrehelper.budgetNeeded = 0;
                            }
                        }
                        const foodItem = await foodModel.findById(orderItem.foodId);
                        if (foodItem) {
                            foodItem.quantity -= orderItem.quantity; // Decrease the quantity
                            if (foodItem.quantity <= 0) {
                                foodItem.quantity = 0; // Ensure no negative values
                                foodItem.status = "Sold Out"; // Mark as Sold Out
                            }
                            await foodItem.save(); // Save the updated food item
                        }
                    }
                }

                // Save the updated case
                await caseWithPrehelper.save();
                // Remove userId from the `prehelper` array
                caseWithPrehelper.prehelper = caseWithPrehelper.prehelper.filter(
                    (id) => id.toString() !== userId
                );
                await caseWithPrehelper.save();

                if (order.payment) {
                    const allItemsDonated = caseWithPrehelper.itemsNeeded.every(
                        (item) => item.isDonated === true
                    );

                    // Update the case status based on the items
                    if (allItemsDonated) {
                        caseWithPrehelper.status = "done";
                    } else {
                        caseWithPrehelper.status = "processing";
                    }

                    await caseWithPrehelper.save();

                    // Notify only admins with the role "Leader" if the case is marked as "done"
                    if (caseWithPrehelper.status === "done") {
                        const leaders = await adminModel.find({ role: "Leader" });
                        const notifications = leaders.map((leader) => ({
                            sender: userId,
                            senderModel: "user",
                            receiver: leader._id,
                            receiverModel: "Admin",
                            message: `The case "${caseWithPrehelper.title}" is done`,
                        }));

                        await notificationModel.insertMany(notifications);
                    }
                }

                // Send a response for the `caseWithPrehelper` path
                return res.status(200).json({
                    success: true,
                    message: "Order processed successfully for case with prehelper.",
                    case: caseWithPrehelper,
                });
            } else {
                // Fallback to finding the current case (original logic)
                const currentCase = await Case.findOne({
                    helperId: userId,
                    status: "processing",
                });

                if (!currentCase) {
                    return res.status(404).json({ message: "Case not found" });
                }

                currentCase.orderId.push(orderId); // Changed from `=` to `.push()` for consistency
                console.log("second time");

                await currentCase.save();

                const order = await orderModel.findById(orderId);

                if (!order) {
                    return res.status(404).json({
                        success: false,
                        message: "Order not found",
                    });
                }

                for (const orderItem of order.items) {
                    const itemIndex = currentCase.itemsNeeded.findIndex(
                        (item) => item.id.toString() === orderItem.foodId.toString()
                    );
                    if (itemIndex !== -1) {
                        currentCase.itemsNeeded[itemIndex].isDonated = true;
                        currentCase.itemsNeeded[itemIndex].prehelperId = userId;

                        const foodItem = await foodModel.findById(orderItem.foodId);
                        console.log("foodItem:", foodItem);

                        if (foodItem) {
                            foodItem.quantity -= orderItem.quantity;
                            if (foodItem.quantity <= 0) {
                                foodItem.quantity = 0;
                                foodItem.status = "Sold Out";
                            }
                            await foodItem.save();
                        }
                    }
                }


                await currentCase.save();

                if (order.payment) {
                    const allItemsDonated = currentCase.itemsNeeded.every(
                        (item) => item.isDonated === true
                    );

                    // Update the case status based on the items
                    if (allItemsDonated) {
                        currentCase.status = "done";

                    } else {
                        currentCase.status = "processing";
                    }

                    await currentCase.save();

                    // Notify only admins with the role "Leader" if the case is marked as "done"
                    if (currentCase.status === "done") {
                        const leaders = await adminModel.find({ role: "Leader" });
                        const notifications = leaders.map((leader) => ({
                            sender: userId,
                            senderModel: "user",
                            receiver: leader._id,
                            receiverModel: "Admin",
                            message: `The case "${currentCase.title}" is done`,
                        }));

                        await notificationModel.insertMany(notifications);
                    }
                    return res.status(200).json({
                        success: true,
                        message: "Case marked as done",
                        case: currentCase,
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: "Payment not completed for this order",
                    });
                }
            }
        } else {
            // If payment failed
            await orderModel.findByIdAndDelete(orderId);
            return res.status(400).json({
                success: false,
                message: "Payment failed. Order deleted.",
            });
        }
    } catch (error) {
        console.error("Error during order verification:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred during order verification",
        });
    }
};

// user orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {
            status: req.body.status,
        });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const markOrderAsMatched = async (req, res) => {
    try {
        const { orderId } = req.params;
        await orderModel.findByIdAndUpdate(orderId, { matched: true });
        res.json({ success: true, message: "Order marked as matched." });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ success: false, message: "Error marking order as matched." });
    }
};

export {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    markOrderAsMatched,
};