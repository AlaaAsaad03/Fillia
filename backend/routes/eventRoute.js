import express from "express";
import multer from "multer";
import { scheduleEvent, createCase, addItem, updateEventStatuses, donateToCase, handleDonationSuccess, buyItem, handlePurchaseSuccess, generateEventAnalytics, getAllEvents, getScheduledEventsWithRequests, updateRequestStatus, getCompletedEvents, getEvent, getAllCases, getAllItems, } from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/auth.js"; // Adjust paths as needed

const eventRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Route to schedule an event
eventRouter.post("/schedule", authMiddleware, scheduleEvent);

// Add a case to an event
eventRouter.post("/case", authMiddleware, createCase);

// Add an item to an event 
eventRouter.post("/item", upload.single("image"), authMiddleware, addItem);

// update the event status
eventRouter.post("/update-statuses", updateEventStatuses);

eventRouter.post("/donate", authMiddleware, donateToCase);

eventRouter.get("/donation-success", authMiddleware, handleDonationSuccess);

eventRouter.post("/buy-item", authMiddleware, buyItem);

eventRouter.get("/purchase-success", authMiddleware, handlePurchaseSuccess);

eventRouter.get("/generate-analytics", generateEventAnalytics);

eventRouter.get("/completed-events", getCompletedEvents)

eventRouter.get("/get", getAllEvents);

eventRouter.get("/scheduled-requests", getScheduledEventsWithRequests);

eventRouter.put("/update-request-status", updateRequestStatus);

eventRouter.get("/event-schedule", authMiddleware, getEvent);

eventRouter.get("/get-cases", authMiddleware, getAllCases);

eventRouter.get("/get-items", authMiddleware, getAllItems);


export default eventRouter;