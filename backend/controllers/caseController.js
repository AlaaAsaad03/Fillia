import Case from "../models/caseModel.js";
import orderModel from "../models/orderModel.js";
import adminModel from "../models/adminModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import axios from "axios";
import TemporaryHistoryModel from '../models/TemporaryHistoryModel.js';
import mongoose from "mongoose";


export const donateItem = async (req, res) => {
  // const { userId } = req.body.userId;
  const { caseId, itemId, userId } = req.body;

  try {
    if (!userId || !caseId || !itemId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const selectedCase = await Case.findById(caseId);
    if (!selectedCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const item = selectedCase.itemsNeeded.find((item) => item.id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in case" });
    }

    if (item.isDonated) {
      return res.status(400).json({ success: false, message: "This item has already been donated" });
    }

    if (!selectedCase.prehelper.includes(userId)) {
      selectedCase.prehelper.push(userId);
    }

    await userModel.findByIdAndUpdate(userId, {
      $push: { cartData: { itemId, quantity: 1 } },
    });

    await selectedCase.save();

    res.status(200).json({ success: true, message: "Item added to cart. Proceed to payment." });
  } catch (error) {
    console.error("Error donating item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new case
export const createCase = async (req, res) => {
  console.log("req body:", req.body);
  console.log("req files:", req.files);

  try {
    const { name, title, description, salary, location, itemsNeeded, targetGroup, phoneNumber, urgency,
      caseType,
      deadline } =
      req.body;
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: "Location data is required" });
    }
    const creatorId = req.body.userId; // Assume `req.user` contains the authenticated user
    console.log(creatorId);
    let budgetNeeded = 0;
    for (const item of itemsNeeded) {
      const foodItem = await foodModel.findById(item.id);
      if (foodItem) {
        budgetNeeded += foodItem.price * (item.quantity || 1);
      }
    }

    const salaryImage = req.files?.salaryImage?.[0]?.filename || null;
    const caseTypeImage = req.files?.caseTypeImage?.[0]?.filename || null;


    if (salary && !salaryImage) {
      return res.status(400).json({ message: "Salary image is required when salary is provided." });
    }

    if (caseType === "medical" && !caseTypeImage) {
      return res.status(400).json({ message: "Medical case type requires an image." });
    }

    // Calculate creatorReputationScore
    const reputationResponse = await axios.get(
      `http://localhost:4000/api/cases/creator-reputation/${creatorId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const creatorReputationScore =
      reputationResponse.data.creatorReputationScore || 0;

    const newCase = new Case({
      creatorId,
      name,
      title,
      description,
      salary,
      location,
      itemsNeeded,
      targetGroup,
      budgetNeeded,
      phoneNumber,
      urgency,
      deadline: deadline || null,
      caseType,
      salaryImage,
      caseTypeImage,
      creatorReputationScore
    });

    await newCase.save();

    // Notify only admins with the role "Leader"
    const leaders = await adminModel.find({ role: "Leader" }); // Filter admins by role
    const notifications = leaders.map((leader) => ({
      sender: creatorId,
      senderModel: "user",
      receiver: leader._id,
      receiverModel: "Admin",
      message: `new case was added by ${name}`,
    }));

    await notificationModel.insertMany(notifications);

    res
      .status(201)
      .json({ message: "Case created successfully", case: newCase });
  } catch (error) {
    console.error("Error creating case:", error); // Log the full error
    res.status(500).json({ message: "Error creating case", error: error.message });
  }
};

// Admin: Review and update case acceptance status
export const updateCaseStatus = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { caseId } = req.params;
    const { acceptanceStatus } = req.body; // 'accepted', 'rejected', or 'loading'

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { acceptanceStatus },
      { new: true }
    );

    // Notify the user
    const message =
      acceptanceStatus === "accepted"
        ? `Your case ${updatedCase.title} was accepted.`
        : `Your case ${updatedCase.title} was rejected.`;

    await notificationModel.create({
      sender: userId, // Admin ID
      senderModel: "Admin",
      receiver: updatedCase.creatorId,
      receiverModel: "user",
      message,
    });

    if (!updatedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.status(200).json({ message: "Case status updated", case: updatedCase });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating case status", error: error.message });
  }
};

// Get all cases (filter by acceptanceStatus and prioritize by creator's accepted case count)
export const getCase = async (req, res) => {
  try {
    const { acceptanceStatus = "accepted", status = "processing" } = req.query;
    const userId = req.body.userId; // Assuming the logged-in user's ID is available in `req.body`

    console.log("useeeeeeeeer:", userId);

    // Check if the user is currently helping a case with status === "processing"
    const currentCase = await Case.findOne({
      helperId: userId,
      status: "processing",
    });
    if (!currentCase) {
      console.log("no current case");
    }

    // Aggregate cases to prioritize users with fewer accepted cases
    const cases = await Case.aggregate([
      {
        $match: {
          acceptanceStatus, // Filter by acceptanceStatus
          helperId: null, // Ensure helperId is null
          status,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: "$creator", // Unwind the creator details
      },
      {
        $group: {
          _id: "$creatorId",
          creator: { $first: "$creator" },
          acceptedCaseCount: {
            $sum: { $cond: [{ $eq: ["$acceptanceStatus", "accepted"] }, 1, 0] },
          },
          cases: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { acceptedCaseCount: 1 }, // Sort by accepted case count (ascending)
      },
      {
        $unwind: "$cases", // Flatten the cases array
      },
      {
        $replaceRoot: { newRoot: "$cases" }, // Replace root to get original case documents
      },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: "$creator", // Unwind again for final population
      },
    ]);

    console.log("cases:", cases);

    // Add `isApplicable` field for the logged-in user
    const updatedCases = cases.map((caseItem) => {
      const isApplicable =
        currentCase &&
          caseItem.status === "processing" &&
          caseItem.helperId === null
          ? false
          : true;

      return { ...caseItem, isApplicable }; // Add isApplicable dynamically
    });
    console.log("updatedCases:", updatedCases);

    let recommendedTitles = [];
    try {
      // Call the recommender system to get recommended titles
      const recommenderResponse = await axios.post(
        'http://localhost:4000/api/recommend/recommend-cases',
        {},
        { headers: { Authorization: req.headers.authorization } }
      );

      if (
        recommenderResponse.data.success &&
        Array.isArray(recommenderResponse.data.recommendations)
      ) {
        recommendedTitles = recommenderResponse.data.recommendations;
      }
    } catch (error) {
      console.log("Error fetching recommendations:", error.message);
    }

    // Separate cases into recommended and other groups
    const recommendedCases = recommendedTitles.length
      ? updatedCases.filter((caseItem) =>
        recommendedTitles.includes(caseItem.title)
      )
      : [];
    const otherCases = recommendedTitles.length
      ? updatedCases.filter(
        (caseItem) => !recommendedTitles.includes(caseItem.title)
      )
      : updatedCases;

    res.status(200).json({
      message: "Cases retrieved successfully with priority and applicability",
      recommendedCases,
      otherCases,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cases", error: error.message });
  }
};


export const getUserCases = async (req, res) => {
  console.log("Request params:", req.params);
  try {
    const { userId } = req.params;

    // Validate that userId is provided
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Find cases where the user is the direct helper
    const helpedCases = await Case.find({ helperId: userId }).lean();

    // Filter itemsNeeded in helpedCases
    const filteredHelpedCases = helpedCases.map((caseItem) => ({
      ...caseItem,
      itemsNeeded: caseItem.itemsNeeded.filter(
        (item) => !item.prehelperId || item.prehelperId.toString() === userId
      ),
    }));

    // Find cases where the user is a prehelper for at least one item
    const otherCases = await Case.find({
      helperId: { $ne: userId },
      "itemsNeeded.prehelperId": userId
    }).lean();

    // Filter out items where prehelperId is NOT the userId
    const filteredOtherCases = otherCases.map((caseItem) => ({
      ...caseItem,
      itemsNeeded: caseItem.itemsNeeded.filter(
        (item) => item.prehelperId?.toString() === userId
      ),
    }));

    // Combine both sets of cases
    const combinedCases = [...filteredHelpedCases, ...filteredOtherCases];

    res.status(200).json({
      message: "Cases retrieved successfully",
      cases: combinedCases,
    });
  } catch (error) {
    console.error("Error fetching cases:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching cases", error: error.message });
  }
};

// for admin
export const getCases = async (req, res) => {
  try {
    // Define the array of acceptance statuses
    const acceptanceStatuses = ["accepted", "loading", "rejected", "waiting"];

    // Fetch cases matching the criteria
    const cases = await Case.find({
      acceptanceStatus: { $in: acceptanceStatuses },
    }).populate("creatorId", "name email");

    res.status(200).json({ message: "Cases retrieved successfully", cases });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cases", error: error.message });
  }
};

// Get all cases created by the user
export const getUserCreatedCases = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the route parameters

    // Validate that userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find cases by creatorId
    const cases = await Case.find({
      creatorId: userId,
      acceptanceStatus: "accepted",
    }).populate("creatorId", "name email");

    if (cases.length === 0) {
      return res
        .status(404)
        .json({ message: "No cases found for the given user ID" });
    }

    res.status(200).json({ message: "Cases retrieved successfully", cases });
  } catch (error) {
    console.error("Error fetching user created cases:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching cases", error: error.message });
  }
};

// Mark a case as taken by a helper
export const takeCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const helperId = req.body.userId;

    // Check if the user already has an assigned case
    const existingCase = await Case.findOne({
      helperId,
      availability: "not available",
      status: "processing"
    });
    if (existingCase) {
      return res
        .status(400)
        .json({ message: "You can only take one case at a time." });
    }

    // Attempt to assign the new case
    const updatedCase = await Case.findOneAndUpdate(
      { _id: caseId, availability: "available", acceptanceStatus: "accepted" },
      { helperId, availability: "not available" },
      { new: true }
    );

    if (!updatedCase) {
      return res
        .status(404)
        .json({ message: "Case not available or already taken." });
    }

    res
      .status(200)
      .json({ message: "Case successfully taken", case: updatedCase });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error taking case", error: error.message });
  }
};

// Mark a case as done
export const completeCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const updatedCase = await Case.findOneAndUpdate(
      { _id: caseId, helperId: req.user.id },
      { status: "done" },
      { new: true }
    );

    if (!updatedCase) {
      return res
        .status(404)
        .json({ message: "Case not found or you are not the helper" });
    }

    res.status(200).json({ message: "Case marked as done", case: updatedCase });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error completing case", error: error.message });
  }
};

export const deleteCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const deletedCase = await Case.findByIdAndDelete(caseId);

    if (!deletedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    res
      .status(200)
      .json({ message: "Case deleted successfully", case: deletedCase });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting case", error: error.message });
  }
};

// Mark an order as associated with a case
export const associateOrderWithCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { orderId } = req.body;

    // Check if the user has an active case
    const caseToUpdate = await Case.findOne({
      _id: caseId,
      availability: "not available",
      status: "processing",
    });

    if (!caseToUpdate) {
      return res
        .status(404)
        .json({ message: "Active case not found or case is not available" });
    }

    // Associate the orderId with the case
    caseToUpdate.orderId = orderId;
    await caseToUpdate.save();

    res.status(200).json({
      message: "Order ID successfully associated with the case",
      case: caseToUpdate,
    });
  } catch (error) {
    console.error("Error associating order with case:", error);
    res.status(500).json({
      message: "Error associating order with case",
      error: error.message,
    });
  }
};

// Check payment status and mark case as done
export const checkPaymentAndMarkCaseDone = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { userId } = req.body.userId;

    // Fetch the case
    const caseToCheck = await Case.findById(caseId);

    if (!caseToCheck) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (!caseToCheck.orderId) {
      return res
        .status(400)
        .json({ message: "Order ID not associated with this case" });
    }

    // Fetch order details using orderController logic
    const order = await orderModel.findById(caseToCheck.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check payment status
    if (order.payment) {
      // Mark the case as done
      caseToCheck.status = "done";
      await caseToCheck.save();

      // Notify only admins with the role "Leader"
      const leaders = await adminModel.find({ role: "Leader" }); // Filter admins by role
      const notifications = leaders.map((leader) => ({
        sender: userId,
        senderModel: "user",
        receiver: leader._id,
        receiverModel: "Admin",
        message: `The case "${caseToCheck.title}" is done`,
      }));

      await notificationModel.insertMany(notifications);

      res
        .status(200)
        .json({ message: "Case marked as done", case: caseToCheck });
    } else {
      res.status(400).json({ message: "Payment not completed for this order" });
    }
  } catch (error) {
    console.error("Error checking payment and marking case as done:", error);
    res.status(500).json({
      message: "Error checking payment and marking case as done",
      error: error.message,
    });
  }
};

export const verifyCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { userVerification: "Delivered" },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    res
      .status(200)
      .json({ message: "Case marked as delivered", case: updatedCase });
  } catch (error) {
    console.error("Error verifying case:", error);
    res
      .status(500)
      .json({ message: "Error verifying case", error: error.message });
  }
};

export const getPackingCases = async (req, res) => {
  try {
    const cases = await Case.find({ level: "packing" })
      .select("title dateCreated itemsNeeded orderId")
      .populate("orderId");

    const formattedCases = await Promise.all(
      cases.map(async (c) => {
        const orders = await orderModel.find({ _id: { $in: c.orderId } });

        const orderItems = orders.flatMap((order) => order.items);

        return {
          _id: c._id,
          title: c.title,
          dateCreated: c.dateCreated,
          itemsNeeded: c.itemsNeeded,
          orderItems,
        };
      })
    );

    res.status(200).json({ success: true, cases: formattedCases });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching packing cases",
      error: error.message,
    });
  }
};

// Get cases with level === "out for delivery"
export const getDeliveryCases = async (req, res) => {
  try {
    const cases = await Case.find({ level: "out for delivery" }).select(
      "title dateCreated location phoneNumber"
    );
    res.status(200).json({ success: true, cases });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery cases",
      error: error.message,
    });
  }
};

export const updateCaseLevel = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { caseId } = req.params;
    const { level } = req.body;

    // Initialize the updated data
    const updatedData = { level };

    // Update fields based on the level
    if (level === "packing") {
      const packagers = await adminModel.find({ role: "Packager" });
      const notifications = packagers.map((Packager) => ({
        sender: userId,
        senderModel: "Admin",
        receiver: Packager._id,
        receiverModel: "Admin",
        message: `Case is ready for packing`,
      }));

      await notificationModel.insertMany(notifications);
    }

    if (level === "out for delivery") {
      updatedData.packagedBy = userId; // Save `packagedBy` for this level
      const deliveryUsers = await adminModel.find({ role: "Delivery" });
      const notifications = deliveryUsers.map((deliveryUser) => ({
        sender: userId,
        senderModel: "Admin",
        receiver: deliveryUser._id,
        receiverModel: "Admin",
        message: `Case is ready for delivery`,
      }));

      await notificationModel.insertMany(notifications);
    }

    if (level === "delivered") {
      updatedData.deliveriedBy = userId; // Save `deliveriedBy` for this level
      await notificationModel.create({
        sender: userId,
        senderModel: "Admin",
        receiver: updatedData.creatorId,
        receiverModel: "user",
        message: `Case has been delivered, please confirm`,
      });
    }

    // Update the case with the updatedData
    const updatedCase = await Case.findByIdAndUpdate(caseId, updatedData, { new: true });

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.status(200).json({
      success: true,
      case: updatedCase,
    });
  } catch (error) {
    console.error("Error updating case level:", error);
    res.status(500).json({
      success: false,
      message: "Error updating case level",
      error: error.message,
    });
  }
};

export const getForRecommend = async (req, res) => {
  try {
    const { acceptanceStatus = "accepted", status = "processing" } = req.query;
    const userId = req.body.userId;

    // Step 1: Retrieve the user's history cases
    const userHistoryCases = await Case.find({
      "itemsNeeded.prehelperId": userId,
    }).lean();

    const filteredUserHistoryCases = userHistoryCases.map((caseItem) => ({
      ...caseItem,
      itemsNeeded: caseItem.itemsNeeded.filter(
        (item) => item.prehelperId?.toString() === userId.toString()
      ),
    }));

    // Step 2: Retrieve all recommendation cases
    const recommendationCases = await Case.aggregate([
      {
        $match: {
          acceptanceStatus,
          helperId: null,
          status,
          notInterestedBy: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: "$creator" },
      {
        $group: {
          _id: "$creatorId",
          creator: { $first: "$creator" },
          acceptedCaseCount: {
            $sum: { $cond: [{ $eq: ["$acceptanceStatus", "accepted"] }, 1, 0] },
          },
          cases: { $push: "$$ROOT" },
        },
      },
      { $sort: { acceptedCaseCount: 1 } },
      { $unwind: "$cases" },
      { $replaceRoot: { newRoot: "$cases" } },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: "$creator" },
    ]);

    console.log("recommendationCases:", recommendationCases);

    // Step 3: Filter out cases the user has helped with
    const filteredRecommendationCases = recommendationCases
      .filter((caseItem) =>
        caseItem.itemsNeeded.every(
          (item) => item.prehelperId?.toString() !== userId.toString()
        )
      )
      .map((caseItem) => ({
        ...caseItem,
        itemsNeeded: caseItem.itemsNeeded.filter(
          (item) => item.isDonated === false
        ),
      }));

    // Step 4: Respond with recommendations
    res.status(200).json({
      message: "Cases retrieved successfully for recommendations",
      cases: filteredRecommendationCases,
      userHistoryCases: filteredUserHistoryCases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cases",
      error: error.message,
    });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming the logged-in user's ID is available in `req.body.userId`

    // 1. Find all cases the user helped (itemsNeeded.prehelperId: userId)
    const userHistoryCases = await Case.find({
      "itemsNeeded.prehelperId": userId,
    }).lean();

    console.log("user-History", userHistoryCases);

    let casesToRecommend;

    if (userHistoryCases.length === 0) {
      // If the user has no history, use temporary history
      const temporaryHistory = await TemporaryHistoryModel.findOne({ userId })
        .populate("caseIds") // Populate the case details
        .lean();

      if (temporaryHistory && temporaryHistory.caseIds.length > 0) {
        casesToRecommend = temporaryHistory.caseIds;
        console.log("Using temporary history cases:", casesToRecommend);
      } else {
        return res.status(404).json({
          success: false,
          message: "No user history or temporary history found.",
        });
      }
    } else {
      // 2. Filter itemsNeeded to include only items this user helped with
      const filteredHistoryCases = userHistoryCases.map((caseItem) => ({
        ...caseItem,
        itemsNeeded: caseItem.itemsNeeded.filter(
          (item) => item.prehelperId?.toString() === userId.toString()
        ),
      }));
      casesToRecommend = filteredHistoryCases;
    }

    res.status(200).json({
      success: true,
      message: "User history cases retrieved successfully.",
      cases: casesToRecommend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user history cases.",
      error: error.message,
    });
  }
};

// Get cases for map display
export const getDeliveryLocations = async (req, res) => {
  try {
    const cases = await Case
      .find({ level: "delivered" })
      .select("location targetGroup budgetNeeded itemsNeeded");

    res.status(200).json({ success: true, cases });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery locations",
      error: error.message,
    });
  }
};

export const filterCases = async (req, res) => {
  try {
    // Fetch cases with specified conditions
    const cases = await Case.find({
      acceptanceStatus: "accepted",
      status: "processing",
      helperId: null,
    });

    // Filter itemsNeeded for each case
    const filteredCases = cases.map((caseItem) => ({
      ...caseItem.toObject(),
      itemsNeeded: caseItem.itemsNeeded.filter((item) => !item.isDonated),
    }));

    res.status(200).json({
      message: "Filtered cases retrieved successfully",
      cases: filteredCases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving cases",
      error: error.message,
    });
  }
};

export const saveTemporaryHistory = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { caseIds } = req.body;


    // Validate input
    if (!userId || !Array.isArray(caseIds) || caseIds.length === 0) {
      return res.status(400).json({
        message: "Invalid input. Provide a valid userId and a non-empty array of caseIds.",
      });
    }

    // Create a new temporary history record
    const newHistory = new TemporaryHistoryModel({
      userId,
      caseIds,
    });

    await newHistory.save();

    res.status(201).json({
      message: "Temporary history saved successfully.",
      data: newHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving temporary history.",
      error: error.message,
    });
  }
};

export const calculateCreatorReputationScore = async (req, res) => {
  try {
    const { userId } = req.params; // User ID for whom the score is calculated

    // Step 1: Fetch all cases created by this user
    const totalCases = await Case.find({ creatorId: userId });

    if (!totalCases.length) {
      return res.status(200).json({
        message: "No cases found for this user.",
        creatorReputationScore: 0,
      });
    }

    // Step 2: Count the rejected cases 
    const rejectedCases = totalCases.filter(
      (c) => c.acceptanceStatus === "rejected"
    ).length;

    // Step 3: Count the completed cases 
    const completedCases = totalCases.filter(
      (c) => c.acceptanceStatus === "accepted" && c.status === "done"
    );

    // Step 4: Calculate TimelinessRate 
    const onTimeCases = completedCases.filter((c) => {
      if (!c.deadline) return true; // No specific deadline means it's "on time"
      return c.dateDelivered <= c.deadline; // Check if delivered on or before the deadline
    }).length;


    const TimelinessRate =
      completedCases.length > 0
        ? onTimeCases / completedCases.length
        : 0;

    // Step 5: Calculate the final creatorReputationScore
    const creatorReputationScore =
      (completedCases.length + TimelinessRate * completedCases.length - rejectedCases) /
      totalCases.length *
      100;

    res.status(200).json({
      message: "Creator reputation score calculated successfully.",
      creatorReputationScore: Math.max(0, creatorReputationScore.toFixed(2)), // Ensure score is not negative
      totalCases: totalCases.length,
      rejectedCases,
      completedCases: completedCases.length,
      onTimeCases,
      TimelinessRate: TimelinessRate.toFixed(2),
    });
  } catch (error) {
    console.error("Error calculating creator reputation score:", error);
    res.status(500).json({
      message: "Error calculating creator reputation score",
      error: error.message,
    });
  }
};

export const createCaseDetails = async (req, res) => {
  console.log("req body:", req.body);

  try {
    const { name, title, description, salary, location, itemsNeeded, targetGroup, phoneNumber, urgency, caseType, deadline } =
      req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: "Location data is required" });
    }

    const creatorId = req.body.userId; // Assume `req.user` contains the authenticated user
    console.log(creatorId);

    let budgetNeeded = 0;
    for (const item of itemsNeeded) {
      const foodItem = await foodModel.findById(item.id);
      if (foodItem) {
        budgetNeeded += foodItem.price * (item.quantity || 1);
      }
    }

    // Calculate creatorReputationScore
    const reputationResponse = await axios.get(
      `http://localhost:4000/api/cases/creator-reputation/${creatorId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const creatorReputationScore =
      reputationResponse.data.creatorReputationScore || 0;

    const newCase = new Case({
      creatorId,
      name,
      title,
      description,
      salary,
      location,
      itemsNeeded,
      targetGroup,
      budgetNeeded,
      phoneNumber,
      urgency,
      deadline: deadline || null,
      caseType,
      creatorReputationScore,
    });

    await newCase.save();

    // Notify only admins with the role "Leader"
    const leaders = await adminModel.find({ role: "Leader" }); // Filter admins by role
    const notifications = leaders.map((leader) => ({
      sender: creatorId,
      senderModel: "user",
      receiver: leader._id,
      receiverModel: "Admin",
      message: `new case was added by ${name}`,
    }));

    await notificationModel.insertMany(notifications);

    res
      .status(201)
      .json({ message: "Case details created successfully", caseId: newCase._id });
  } catch (error) {
    console.error("Error creating case details:", error); // Log the full error
    res.status(500).json({ message: "Error creating case details", error: error.message });
  }
};

export const addCaseImages = async (req, res) => {
  console.log("req files:", req.files);

  try {
    const { caseId } = req.params;

    const salaryImage = req.files?.salaryImage?.[0]?.filename || null;
    const caseTypeImage = req.files?.caseTypeImage?.[0]?.filename || null;

    if (!caseId) {
      return res.status(400).json({ message: "Case ID is required" });
    }

    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (existingCase.salary && !salaryImage) {
      return res
        .status(400)
        .json({ message: "Salary image is required when salary is provided." });
    }

    if (existingCase.caseType === "medical" && !caseTypeImage) {
      return res
        .status(400)
        .json({ message: "Medical case type requires an image." });
    }

    existingCase.salaryImage = salaryImage;
    existingCase.caseTypeImage = caseTypeImage;

    await existingCase.save();

    res.status(200).json({
      message: "Images added successfully",
      case: existingCase,
    });
  } catch (error) {
    console.error("Error adding images:", error); // Log the full error
    res.status(500).json({ message: "Error adding images", error: error.message });
  }
};

export const UpdateCaseStatusAI = async (req, res) => {
  try {
    const adminId = req.body.userId;
    const cases = await Case.find({
      $and: [
        { acceptanceStatus: "loading" },
        { AiLabel: { $in: ["trusted", "untrusted", "manual_review"] } },
      ],
    });


    for (const caseItem of cases) {
      const { _id, title, AiLabel, creatorId } = caseItem;
      const leaders = await adminModel.find({ role: "Leader" }); // Filter admins by role

      if (AiLabel === "trusted") {
        await Case.findByIdAndUpdate(_id, { acceptanceStatus: "accepted" });
        const message = `Your case ${title} was accepted.`;
        await notificationModel.create({
          sender: adminId, // Admin ID
          senderModel: "Admin",
          receiver: creatorId,
          receiverModel: "user",
          message,
        });
      } else if (AiLabel === "untrusted") {
        await Case.findByIdAndUpdate(_id, { acceptanceStatus: "rejected" });
        const message = `Your case ${title} was rejected.`;
        await notificationModel.create({
          sender: adminId, // Admin ID
          senderModel: "Admin",
          receiver: creatorId,
          receiverModel: "user",
          message,
        });
      } else if (AiLabel === "manual_review") {
        await Case.findByIdAndUpdate(_id, { acceptanceStatus: "waiting" });
        const notifications = leaders.map((leader) => ({
          sender: leader._id, // System notification
          senderModel: "Admin",
          receiver: leader._id,
          receiverModel: "Admin",
          message: `Check the case with title: ${title} to decide its status.`,
        }));
        await notificationModel.insertMany(notifications);

      }
    }

    res.status(200).json({ message: "Cases updated and notifications sent." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating case status", error: error.message });
  }
};

export const getPublicUserCases = async (req, res) => {
  try {
    const { acceptanceStatus = "accepted", status = "processing" } = req.query;
    const cases = await Case.find({
      acceptanceStatus: { $in: acceptanceStatus },
      status: { $in: status }
    })
    res.status(200).json({ success: true, message: "Cases retrieved successfully", cases })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cases", error: error.message });
  }
}