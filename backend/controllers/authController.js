import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import crypto from 'crypto'
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from '../config/emailTemplate.js'
import adminModel from "../models/adminModel.js";
import nodemailer from "nodemailer";



export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check in both models
        let user = await userModel.findOne({ email });
        let isAdmin = false;

        if (!user) {
            user = await adminModel.findOne({ email });
            isAdmin = true;
        }

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            token,
            redirectTo: user.role === 'Leader' || user.role === 'Packager' || user.role === 'Delivery' ? "/admin" : "/user",
            isFirstLogin: user.isFirstLogin, // Include this flag
            message: "Logged in successfully",
            user: { ...user._doc, password: undefined },
        });
        // Update the first login flag
        if (user.isFirstLogin) {
            user.isFirstLogin = false;
            await user.save();
        }

    } catch (error) {
        console.error("Error in login:", error);
        res.json({ success: false, message: "Error occurred" });
    }
};

export const createToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }

    try {
        // Check if the user/admin already exists
        let existingUser, existingAdmin;
        if (role === 'user') {
            existingUser = await userModel.findOne({ email });
        } else if (role === 'Leader' || 'packager' || 'delivery' || 'admin') {
            existingAdmin = await adminModel.findOne({ email });
        }

        if (existingUser || existingAdmin) {
            return res.json({ success: false, message: "Email already registered" });
        }

        // validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Weak password" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        // Create
        //  new user/admin
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: "user",
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        })


        const user = await newUser.save();
        const token = createToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for SSL
            auth: {
                user: "filliaspprt@gmail.com",
                pass: "jixa brvi qjks aczy", // Replace with generated password
            },
        });

        // Send email with verification token
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{verificationToken}}", verificationToken).replace("{{email}}", user.email),
            category: "Email Verification",
        }

        await transporter.sendMail(mailOption);
        console.log("Verification email sent successfully");


        res.json({
            success: true, token, message: "Registered successfully",
            user: { ...user._doc, password: undefined },
        });
    } catch (error) {
        console.error("Error in register:", error);
        res.json({ success: false, message: "Error occurred" });
    }

};

//logout user
const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//verify email
// const verifyEmail = async (req, res) => {

//     const { code } = req.body;

//     try {

//         // Search for the verification token in both collections
//         const user = await userModel.findOne({
//             verificationToken: code,
//             verificationTokenExpiresAt: { $gt: Date.now() },
//         });

//         const admin = await adminModel.findOne({
//             verificationToken: code,
//             verificationTokenExpiresAt: { $gt: Date.now() },
//         });

//         const account = user || admin;
//         if (!account) {
//             return res.json({ success: false, message: "Invalid or expired verification code" });
//         }

//         account.isVerified = true;
//         account.verificationToken = undefined;
//         account.verificationTokenExpiresAt = undefined;
//         await account.save();
//         const mailOption = {
//             from: process.env.SENDER_EMAIL,
//             to: account.email,
//             subject: 'Welcome Email',
//             html: WELCOME_EMAIL_TEMPLATE.replace("{{donorName}}", account.name).replace("{{email}}", account.email),
//             category: "Email Verification",
//         }
//         await transporter.sendMail(mailOption);
//         console.log("Email Sent Successfully");
//         res.json({
//             success: true, message: "Email Verified",
//             account: {
//                 ...account._doc,
//                 password: undefined,
//             },
//         });
//     }
//     catch (error) {
//         console.log("error in verifyEmail ", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// }

const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await userModel.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        const admin = await adminModel.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        const account = user || admin;
        if (!account) {
            return res.json({ success: false, message: "Invalid or expired verification code" });
        }

        account.isVerified = true;
        account.verificationToken = undefined;
        account.verificationTokenExpiresAt = undefined;

        await account.save();  // Ensure this operation is successful

        // Send welcome email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: account.email,
            subject: 'Welcome Email',
            html: WELCOME_EMAIL_TEMPLATE.replace("{{donorName}}", account.name).replace("{{email}}", account.email),
        };

        await transporter.sendMail(mailOption);
        console.log("Welcome email sent successfully");

        res.json({
            success: true, message: "Email Verified",
            account: {
                ...account._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//forgot password for admin and user
const forgotPassword = async (req, res) => {
    const { email, role } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Missing details" });
    }


    try {
        // Search for user in both models
        let user = await userModel.findOne({ email });
        let role = 'user';

        if (!user) {
            user = await adminModel.findOne({ email });
            role = 'admin';
        }


        if (!user) {
            return res.json({ success: false, message: "Email not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiresAt = Date.now() + 3600000; // 1 hour expiry

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        // Send reset email
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Reset Password',
            html: PASSWORD_RESET_EMAIL_TEMPLATE.replace("{{userName}}", user.name).replace("{{resetURL}}", resetURL).replace("{{email}}", user.email),
            category: "Password Reset",
        }
        await transporter.sendMail(mailOption);

        res.json({ success: true, message: "Reset link sent to your email" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Something went wrong" });
    }
};

//reset password for admin and user
const resetPassword = async (req, res) => {
    const { token } = req.params;  // Token from URL
    const { password } = req.body;

    console.log("Received token from URL:", token);

    try {
        // Search for the reset token in both collections
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        const admin = await adminModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        console.log("User found:", user);
        console.log("Admin found:", admin);

        const account = user || admin;
        if (!account) {
            console.log("No account found or token expired");
            return res.status(404).json({ success: false, message: "Invalid or expired token" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(password, salt);
        account.resetPasswordToken = undefined; // Clear the reset token
        account.resetPasswordExpiresAt = undefined;
        await account.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: account.email,
            subject: 'Successful Password Reset',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
        };
        await transporter.sendMail(mailOption);

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};


const checkAuth = async (req, res) => {
    try {
        // Determine the user's role from the decoded token
        const { role, userId } = req;

        // Select the appropriate model based on the role
        const user = role === 'user'
            ? await userModel.findById(userId).select("-password")
            : await adminModel.findById(userId).select("-password");

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isVerified: user.isVerified, // Include isVerified here
                role: user.role,
            }
        });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.body.userId;
    const role = req.body.role;
    try {
        // Validate input
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match." });
        }

        // Determine if it's a user or admin
        const model = role === "user" ? userModel : adminModel;

        // Find user/admin by ID
        const user = await model.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};





export { logout, verifyEmail, forgotPassword, resetPassword, checkAuth, changePassword }