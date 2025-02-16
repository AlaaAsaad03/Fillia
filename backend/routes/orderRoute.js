import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, markOrderAsMatched } from '../controllers/orderController.js'

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.get("/list", listOrders)
orderRouter.post("/status", updateStatus)
orderRouter.patch("/:orderId/mark-matched", markOrderAsMatched);
export default orderRouter;