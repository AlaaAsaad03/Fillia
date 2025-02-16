import messageModel from "../models/messageModel.js";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import groupModel from "../models/groupModel.js";
import { io } from "../server.js";

// Send a message
export const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.body.userId;
    const role = req.body.role;
    const model = role === "Leader" ? adminModel : userModel;

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: "Invalid sender or receiver ID" });
        }

        // Create and save message
        const message = new messageModel({
            sender: senderId,
            receiver: receiverId,
            content,
        });
        await message.save();

        // Check if the receiver is online or in the same chat room
        const receiver = await model.findById(receiverId);
        if (receiver.isOnline) {
            // If the receiver is online, send it as "delivered"
            io.to(receiverId).emit("receiveMessage", {
                ...message.toObject(),
                status: receiver.currentChat === senderId ? "read" : "delivered",
            });

            // If the receiver is in the chat, mark it as read
            if (receiver.currentChat === senderId) {
                message.isRead = true;
                await message.save();
            }
            if (!receiver.isOnline || receiver.currentChat !== senderId) {
                io.to(receiverId).emit("notification", {
                    senderId,
                    message: `New message from ${req.user.name}`,
                });
            }

            if (data.isGroup) {
                const group = await groupModel.findById(data.groupId).populate("members", "name");
                const sender = await userModel.findById(senderId, "name");

                console.log("group", group)
                group.members.forEach(member => {
                    io.to(member._id).emit("receiveMessage", {
                        ...message.toObject(),
                        senderName: sender.name, // Include sender's name
                        groupName: group.name
                    });
                });
            }
        } else {
            // If the receiver is offline, mark as "sent"
            io.to(receiverId).emit("notification", {
                senderId,
                message: `New message from ${req.user.name}`,
            });
        }

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

// Get messages between two users
export const getMessages = async (req, res) => {
    const { userId } = req.body;
    const { receiverId } = req.query;

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: "Invalid userId or receiverId" });
        }

        // Convert IDs to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        // Query messages
        const filter = {
            $or: [
                { sender: userObjectId, receiver: receiverObjectId },
                { sender: receiverObjectId, receiver: userObjectId },
            ],
        };

        const unreadCount = await messageModel.countDocuments({
            receiver: userId,
            isRead: false,
        });



        const messages = await messageModel.find(filter).sort({ timestamp: 1 });

        res.status(200).json({ success: true, messages, unreadCount });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

// Get messages between two users
export const getGroupMessages = async (req, res) => {
    const { userId } = req.body;
    const { receiverId } = req.query;

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid userId or receiverId" });
        }

        // Convert IDs to ObjectId
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        // Query messages
        const filter = {
            $or: [{ receiver: receiverObjectId }],
        };

        const unreadCount = await messageModel.countDocuments({
            receiver: userId,
            isRead: false,
        });

        const user = await userModel.findById(userId);
        if (!user) {
            const messages = await messageModel
                .find(filter)
                .sort({ timestamp: 1 })
                .populate("sender", "name");
            const formattedMessages = messages.map((msg) => ({
                ...msg.toObject(),
                senderName:
                    msg.sender && msg.sender._id != userId ? msg.sender.name : "", // Attach sender's name or leave blank
            }));
            //  res
            //    .status(200)
            //    .json({ success: true, messages: formattedMessages, unreadCount });
            //  console.log("messages", messages);

            const groupedMessages = {
                receiverMessages: formattedMessages.filter(
                    (msg) => msg.senderName === "" // Messages sent by the receiver
                ),
                senderMessages: formattedMessages.filter(
                    (msg) => msg.senderName !== "" // Messages sent by the sender
                ),
            };

            // Respond with grouped messages and unread count
            res.status(200).json({
                success: true,
                groupedMessages,
                unreadCount,
            });

            console.log("Grouped messages:", groupedMessages);
        } else {
            let leaderName = "";

            // Fetch all group members without filtering by receiverId
            const groups = await groupModel.find().populate([
                { path: "members", model: "user", select: "name role" },
                { path: "createdBy", model: "Admin", select: "name role" },
            ]);

            // Find the `Leader` from the `Admin` table
            for (const group of groups) {
                if (group.createdBy.role === "Leader") {
                    leaderName = group.createdBy.name;
                    break; // Exit loop as there's only one `Leader`
                }
            }
            const messages = await messageModel
                .find(filter)
                .sort({ timestamp: 1 })
                .populate("sender", "name");
            const formattedMessages = messages.map((msg) => ({
                ...msg.toObject(),
                senderName: msg.sender
                    ? msg.sender._id != userId
                        ? msg.sender.name
                        : ""
                    : leaderName, // Assign the leader's name if sender is null
            }));

            const groupedMessages = {
                receiverMessages: formattedMessages.filter(
                    (msg) => msg.senderName === "" // Messages sent by the receiver
                ),
                senderMessages: formattedMessages.filter(
                    (msg) => msg.senderName !== "" // Messages sent by the sender
                ),
            };

            // Respond with grouped messages and unread count
            res.status(200).json({
                success: true,
                groupedMessages,
                unreadCount,
            });

            console.log("Grouped messages:", groupedMessages);
        }

        //   res
        //     .status(200)
        //     .json({ success: true, messages: formattedMessages, unreadCount });
        //    console.log("messages", messages);

        // Group messages


    } catch (error) {
        console.error("Error fetching messages:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch messages" });
    }
};


/*// Mark a message as read
export const markAsRead = async (req, res) => {
  const { messageId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid messageId" });
    }

    const message = await messageModel.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};
*/

export const markAsRead = async (req, res, io) => {
    const { receiverId, senderId } = req.body;

    try {
        // Update all unread messages to "read"
        const result = await messageModel.updateMany(
            { receiver: receiverId, sender: senderId, isRead: false },
            { isRead: true }
        );

        // Notify the sender that the messages are read
        io.to(senderId).emit("messagesRead", { receiverId });

        res.status(200).json({ success: true, updatedCount: result.nModified });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ success: false, message: "Failed to mark messages as read" });
    }
};

// Add user to a group
export const addUserToGroup = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid groupId or userId" });
        }

        // Find the group
        const group = await groupModel.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        // Check if user is already a member
        const isMember = group.members.some((memberId) => memberId.toString() === userId);
        if (isMember) {
            return res.status(400).json({ success: false, message: "User is already a member of the group" });
        }

        // Add user to group members
        group.members.push(userId);
        await group.save();

        // Populate members and return the updated group
        const updatedGroup = await groupModel.findById(groupId).populate("members", "name");
        res.status(200).json({ success: true, group: updatedGroup });
    } catch (error) {
        console.error("Error adding user to group:", error);
        res.status(500).json({ success: false, message: "Failed to add user to group" });
    }
};
