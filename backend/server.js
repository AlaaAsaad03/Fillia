import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import profileRouter from "./routes/profileRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import caseRouter from "./routes/caseRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import feedbackRouter from "./routes/feedbackRoute.js";
import adminRouter from "./routes/adminRoute.js";
import statisticsRouter from "./routes/statisticsRoute.js";
import authRouter from './routes/authRoute.js'
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import chatRouter from "./routes/chatRoute.js";
import messageModel from "./models/messageModel.js";
import userModel from "./models/userModel.js";
import mongoose from "mongoose";
import adminModel from "./models/adminModel.js";
import recommendRouter from "./routes/recommendRoute.js";
import session from 'express-session';
import cookieParser from "cookie-parser";
import passport from "passport";
import './config/passport.js';
import { OAuth2Client } from 'google-auth-library'; // To verify the Google token
import jwt from 'jsonwebtoken'; // To generate JWT token
import axios from 'axios';
import validationRouter from "./routes/imageValidationRoute.js"
import predicLabelRouter from "./routes/predictLabelRoute.js";
import suggestionRouter from "./routes/suggestionRoute.js";
import notificationRouter from "./routes/notificationRoute.js"
import requestRouter from "./routes/requestRoute.js";
import eventRouter from "./routes/eventRoute.js";

// app configs
const app = express();
const port = 4000;
const allowedOrigins = ['http://localhost:5173',];

// CORS configuration
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"], // Add any custom headers you need
};



// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser()); // allows us to parse incoming cookies
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth Routes
app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const { user, token } = req.user;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,  // Include image
                lastLogin: user.lastLogin,  // Include last login time
                role: user.role,
            },
            message: "Logged in successfully with Google"
        });
    }
);

// Route to verify Google token from frontend and send a JWT back
app.post('/api/auth/google-login', async (req, res) => {
    try {
        const { token } = req.body;

        // Verify the Google token using OAuth2Client
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists by email
        let user = await userModel.findOne({ email });
        if (!user) {
            // If not found, check in the admin model
            user = await adminModel.findOne({ email });
        }
        if (!user) {
            // If user does not exist, create a new one
            user = new userModel({
                googleId,
                email,
                name,
                image: picture,
                isVerified: true,
                role: "user", // Set default role
            });

            await user.save();
        } else if (!user.googleId) {
            // If the user exists but is not linked to Google, link their account
            user.googleId = googleId;
            await user.save();
        }

        // Generate a JWT token
        const jwtToken = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,  // Ensure this is included
        }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Send user data and JWT token to frontend
        res.json({
            success: true,
            token: jwtToken,
            user: {  // Ensure you're returning user details
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role, // Include the role
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Error logging in with Google:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/location/reverse', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching location:', error.message);
        res.status(500).json({ message: 'Error fetching location' });
    }
});



// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/uploads', express.static('uploads'));

// db connection
connectDB();

const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

// Socket.io setup
export const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const activeChats = {};

    // Mark user/admin as online
    socket.on("setOnline", async (data) => {
        const { userId, role } = data;
        const model = role === "Leader" ? adminModel : userModel;

        if (mongoose.Types.ObjectId.isValid(userId)) {
            await model.findByIdAndUpdate(userId, { isOnline: true });
            console.log(`User/Admin ${userId} marked online.`);
        }

        socket.data.userId = userId; // Store userId in socket data
        socket.data.role = role; // Store role in socket data
        socket.join(userId);
    });

    // User joins a chat room
    socket.on("joinRoom", ({ senderId, receiverId }) => {
        activeChats[senderId] = receiverId; // Track the current chat
        console.log(`User ${senderId} is chatting with ${receiverId}`);
    });

    // User leaves the chat room
    socket.on("leaveRoom", ({ senderId }) => {
        delete activeChats[senderId];
        console.log(`User ${senderId} left the chat`);
    });

    socket.on("sendMessage", async (data) => {
        const { senderId, receiverId, content } = data;

        const message = new messageModel({
            sender: new mongoose.Types.ObjectId(senderId),
            receiver: new mongoose.Types.ObjectId(receiverId),
            content,
        });
        await message.save();

        // Check if the receiver is actively in this chat
        if (activeChats[receiverId] === senderId) {
            // Mark message as read
            message.isRead = true;
            await message.save();
            // Notify the sender
            io.to(senderId).emit("messageStatus", {
                messageId: message._id,
                status: "read",
            });
        } else {
            // Notify the sender it was delivered
            io.to(senderId).emit("messageStatus", {
                messageId: message._id,
                status: "delivered",
            });
        }

        // Notify the receiver
        io.to(receiverId).emit("notification", {
            message: `New message from ${senderId}`,
            senderId,
        });

        // Deliver the message
        io.to(receiverId).emit("receiveMessage", message);
    });

    // Typing indicator
    socket.on("typing", (data) => {
        const { senderId, receiverId } = data;
        io.to(receiverId).emit("typing", { senderId });
    });

    // Mark messages as read when the receiver is in the chat
    socket.on("markAsRead", async ({ receiverId, senderId }) => {
        await messageModel.updateMany(
            { receiver: receiverId, sender: senderId, isRead: false },
            { isRead: true }
        );

        // Notify the sender
        io.to(senderId).emit("messagesRead", { receiverId });
    });


    // Mark user/admin as offline on disconnect
    socket.on("disconnect", async () => {
        const { userId, role } = socket.data || {};
        const model = role === "Leader" ? adminModel : userModel;

        if (mongoose.Types.ObjectId.isValid(userId)) {
            await model.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date(),
            });
            console.log(`User/Admin ${userId} marked offline.`);
        }

        console.log(`Client disconnected: ${socket.id}`);
    });
});

// api endpoint
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/cases", caseRouter);
app.use("/api/category", categoryRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/admin", adminRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/suggestion", suggestionRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/recommend", recommendRouter);
app.use('/api/auth', authRouter)
app.use("/api/validate", validationRouter);
app.use("/api/predict", predicLabelRouter);
app.use("/api/request", requestRouter);
app.use("/api/event", eventRouter);





app.get("/", (req, res) => {
    res.send("API Working");
});

export default server;