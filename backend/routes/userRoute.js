import express from "express"
import { getUserById } from "../controllers/userController.js"
import { authMiddleware } from "../middleware/auth.js"

const userRouter = express.Router()


userRouter.get("/:userId", authMiddleware, getUserById);

export default userRouter;