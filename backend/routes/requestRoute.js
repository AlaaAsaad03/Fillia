import express from "express";
import { createRequest, processRequest, questionRequest, getAllRequests } from "../controllers/requestController.js";
import { authMiddleware } from "../middleware/auth.js";
const requestRouter = express.Router();

// Submit a work request
requestRouter.post("/request-work", createRequest);

// Accept/Reject a work request
requestRouter.post("/process-request/:id", processRequest);

// Ask question
requestRouter.post('/send-email', questionRequest);
requestRouter.get("/allRequests", authMiddleware, getAllRequests);

export default requestRouter;
