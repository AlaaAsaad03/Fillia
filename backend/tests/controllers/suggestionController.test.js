import mongoose from "mongoose";
import { mongoServer, connectDB, disconnectDB, checkConnection } from "../utils/setupTestDB";
import suggestionModel from "../../models/suggestionModel";
import userModel from "../../models/userModel";
import adminModel from "../../models/adminModel";
import notificationModel from "../../models/notificationModel";
import {
    suggestFood,
    updateSuggestionStatus,
    listSuggestions,
    deleteSuggestion
} from "../../controllers/suggestionController";
import subCategoryModel from "../../models/subCategoryModel";


jest.mock("../../models/notificationModel");

jest.setTimeout(60000);

beforeAll(async () => {
    await connectDB();
    await checkConnection();
});

beforeEach(async () => {
    jest.spyOn(console, "error").mockImplementation(() => { });
    jest.clearAllMocks();
    await checkConnection();
    await Promise.all([
        userModel.deleteMany({}),
        adminModel.deleteMany({}),
        suggestionModel.deleteMany({}),
        notificationModel.deleteMany({}),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 100));
});

afterAll(async () => {
    try {
        jest.restoreAllMocks();
        await disconnectDB(); // Ensure this is properly disconnecting
    } catch (error) {
        console.error("Error during afterAll cleanup:", error); // Log any errors
    }
});

describe("Suggestion Controller Tests", () => {
    describe("suggestFood", () => {
        it("should save a suggestion and send notifications to leaders", async () => {
            await checkConnection();
            const mockUserId = new mongoose.Types.ObjectId();
            const mockAdminId = new mongoose.Types.ObjectId();
            const mockSubcategoryId = new mongoose.Types.ObjectId();

            const mockReq = {
                body: {
                    name: "Pasta",
                    description: "Delicious pasta",
                    price: 10.5,
                    quantity: 2,
                    subcategoryId: mockSubcategoryId,
                    userId: mockUserId,
                },
                file: { image: "1737193864263photo4.jpg" },
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await userModel.create({
                _id: mockUserId,
                name: "Test User",
                password: "password123",
                email: "test1@example.com",
            });

            await adminModel.create({
                _id: new mongoose.Types.ObjectId(),
                role: "Leader",
                name: "Admin Name",
                email: "admin1@example.com",
                password: "password123",
            });

            await notificationModel.create({
                sender: mockUserId,
                senderModel: "user",
                receiver: mockAdminId,
                receiverModel: "Admin",
                message: "Notification sent",
            });

            await suggestFood(mockReq, mockRes);

            const savedSuggestion = await suggestionModel.findOne({ name: "Pasta" });
            expect(savedSuggestion).not.toBeNull();
            expect(savedSuggestion.name).toBe("Pasta");

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Suggestion submitted successfully",
                    data: expect.any(Object),
                })
            );

        });

        it("should return an error if the user is not found", async () => {
            const mockReq = {
                body: {
                    name: "Pizza",
                    description: "Cheesy pizza",
                    price: 15.0,
                    quantity: 3,
                    subcategoryId: "subcategoryId",
                    userId: new mongoose.Types.ObjectId(),
                },
                file: { image: "image.jpg" },
            };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await suggestFood(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "User not found",
            });
        });
    });

    describe("updateSuggestionStatus", () => {
        it("should update suggestion status and notify the user", async () => {
            await checkConnection();
            const mockUserId = new mongoose.Types.ObjectId();
            const mockAdminId = new mongoose.Types.ObjectId();
            const mockSuggestionId = new mongoose.Types.ObjectId();

            await userModel.create({
                _id: mockUserId,
                name: "Test User",
                password: "password123",
                email: "test1@example.com",
            });

            await suggestionModel.create({
                _id: mockSuggestionId,
                name: "Burger",
                description: "Delicious burger",
                userId: mockUserId,
                status: "pending",
                price: 10.0,
                quantity: 3,
                image: "1737193864263photo4.jpg",
            });

            const mockReq = {
                body: {
                    suggestionId: mockSuggestionId,
                    status: "accepted",
                    userId: mockAdminId,
                },
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await notificationModel.create({
                sender: mockAdminId,
                senderModel: "Admin",
                receiver: mockUserId,
                receiverModel: "user",
                message: "Notification sent",
            });

            await updateSuggestionStatus(mockReq, mockRes);

            const updatedSuggestion = await suggestionModel.findById(
                mockSuggestionId
            );
            expect(updatedSuggestion.status).toBe("accepted");

            const notification = await notificationModel.findOne({
                receiver: mockUserId,
            });
            expect(notification).not.toBeNull();

            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Suggestion status updated successfully",
            });
        });
    });

    describe("listSuggestions", () => {
        it("should retrieve all suggestions", async () => {
            const mockReq = {};
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Create mock suggestions
            const mockUserId = new mongoose.Types.ObjectId();
            const mockSubcategoryId = new mongoose.Types.ObjectId();
            await userModel.create({
                _id: mockUserId,
                name: "Test User",
                password: "password123",
                email: "test1@example.com",
            });

            await suggestionModel.create({
                name: "Pasta",
                description: "Delicious pasta",
                price: 10.5,
                userId: mockUserId,
                status: "pending",
                subcategory: mockSubcategoryId,
                image: "image1.jpg",
                quantity: 2,
            });

            await suggestionModel.create({
                name: "Pizza",
                description: "Cheesy pizza",
                price: 15.0,
                userId: mockUserId,
                status: "pending",
                subcategory: mockSubcategoryId,
                image: "image2.jpg",
                quantity: 3,
            });


            // Call the listSuggestions function
            await listSuggestions(mockReq, mockRes);

            // Check that the response was called with correct data
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array),
                })
            );

            // Verify that the correct number of suggestions is returned
            const responseData = mockRes.json.mock.calls[0][0].data;
            expect(responseData.length).toBe(2); // We created two suggestions
        });

        it("should return an error if there is a database issue", async () => {
            const mockReq = {};
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock the database query to throw an error
            jest.spyOn(suggestionModel, 'find').mockImplementationOnce(() => {
                throw new Error("Database Error");
            });

            await listSuggestions(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "Failed to retrieve suggestions",
            });
        });
    });

    describe("deleteSuggestion", () => {
        it("should delete a suggestion by ID", async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const mockSubcategoryId = new mongoose.Types.ObjectId();
            const mockSuggestionId = new mongoose.Types.ObjectId();

            // Create a suggestion to delete
            const suggestion = await suggestionModel.create({
                _id: mockSuggestionId,
                name: "Pasta",
                description: "Delicious pasta",
                price: 10.5,
                userId: mockUserId,
                status: "pending",
                quantity: 2,
                subcategory: mockSubcategoryId,
                image: "image1.jpg",
            });

            console.log("Suggestion ID:", mockSuggestionId);
            const mockReq = { params: { id: mockSuggestionId } };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the deleteSuggestion function
            await deleteSuggestion(mockReq, mockRes);

            // Check that the response was called with the correct message
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Suggestion deleted successfully",
            });

            // Verify that the suggestion was deleted
            const deletedSuggestion = await suggestionModel.findById(mockSuggestionId);
            expect(deletedSuggestion).toBeNull();
        });


        it("should return a 404 error if the suggestion does not exist", async () => {
            const mockReq = { params: { id: new mongoose.Types.ObjectId() } };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await deleteSuggestion(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "Suggestion not found",
            });
        });

        it("should return a 500 error if there is a database issue", async () => {
            const mockReq = { params: { id: "invalid-id" } };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await deleteSuggestion(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "Failed to delete suggestion",
            });
        });
    });
});

