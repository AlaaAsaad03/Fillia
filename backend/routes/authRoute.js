import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import {
    login, register, logout, verifyEmail,
    forgotPassword, resetPassword,
    checkAuth, changePassword
} from "../controllers/authController.js"

const authRouter = express.Router();


authRouter.get("/check-auth", authMiddleware, checkAuth)

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", logout)
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);
authRouter.post("/change-password", authMiddleware, changePassword);

export default authRouter;