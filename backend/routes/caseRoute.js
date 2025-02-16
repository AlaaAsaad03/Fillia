import express from "express";
import multer from "multer";
import {
  createCase,
  updateCaseStatus,
  getCases,
  takeCase,
  completeCase,
  deleteCase,
  getCase,
  getUserCases,
  associateOrderWithCase,
  checkPaymentAndMarkCaseDone,
  getUserCreatedCases,
  verifyCase,
  getPackingCases,
  getDeliveryCases,
  updateCaseLevel,
  donateItem,
  getForRecommend,
  getUserHistory,
  getDeliveryLocations,
  filterCases,
  saveTemporaryHistory,
  calculateCreatorReputationScore,
  createCaseDetails,
  addCaseImages,
  UpdateCaseStatusAI,
  getPublicUserCases
} from "../controllers/caseController.js";
import { authMiddleware, authorizationMiddleware } from "../middleware/auth.js";
import notificationModel from "../models/notificationModel.js";
import adminModel from "../models/adminModel.js";
import Case from "../models/caseModel.js";

const caseRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    // Generating a unique filename for each uploaded file
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// User routes
caseRouter.post("/createcase/details", authMiddleware, createCaseDetails);

caseRouter.post(
  "/createcase/images/:caseId",
  upload.fields([
    { name: "salaryImage", maxCount: 1 },
    { name: "caseTypeImage", maxCount: 1 },
  ]),
  authMiddleware,
  addCaseImages
);

caseRouter.get("/get", getCases); // Get all cases
caseRouter.get("/getcase", authMiddleware, getCase); // list in the user page the cases
caseRouter.patch("/:caseId/take", authMiddleware, takeCase); // Take a case
caseRouter.patch("/:caseId/complete", authMiddleware, completeCase);// Mark case as done
caseRouter.get("/:userId/getusercase", authMiddleware, getUserCases);
caseRouter.get("/created/:userId", authMiddleware, getUserCreatedCases);
// Associate an order with a case
caseRouter.patch("/:caseId/associate-order", authMiddleware, associateOrderWithCase);

// Check payment status and mark the case as done
caseRouter.patch("/:caseId/check-payment", authMiddleware, checkPaymentAndMarkCaseDone);

// Admin routes
caseRouter.patch("/:caseId/status", updateCaseStatus); // Update case status
caseRouter.delete("/:caseId", deleteCase);
caseRouter.put("/:caseId/verify", verifyCase);

// Get packing cases
caseRouter.get("/packing", authMiddleware, authorizationMiddleware(["Leader", "Packager"]), getPackingCases);

// Get delivery cases
caseRouter.get("/delivery", authMiddleware, authorizationMiddleware(["Leader", "Delivery"]), getDeliveryCases);

// Update case level
caseRouter.patch("/:caseId/update-level", authMiddleware, authorizationMiddleware(["Leader", "Packager", "Delivery"]), updateCaseLevel);
caseRouter.post('/donate-item', authMiddleware, donateItem);
caseRouter.get("/get-for", authMiddleware, getForRecommend);
caseRouter.get('/user-history', authMiddleware, getUserHistory);
caseRouter.get("/delivery-locations", getDeliveryLocations);
caseRouter.get("/filter", filterCases);
caseRouter.post('/save-temporary-history', authMiddleware, saveTemporaryHistory);

// Update the route to include file uploads

caseRouter.get("/creator-reputation/:userId", authMiddleware, calculateCreatorReputationScore);

caseRouter.post("/update-case-status", authMiddleware, UpdateCaseStatusAI);
caseRouter.get("/public-user-cases", getPublicUserCases);


export default caseRouter;


