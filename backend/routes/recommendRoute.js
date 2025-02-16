import express from 'express';
import { exec } from 'child_process';
import { authMiddleware } from "../middleware/auth.js";

const recommendRouter = express.Router();

recommendRouter.post('/recommend-cases', authMiddleware, (req, res) => {
    const casesApiUrl = "http://localhost:4000/api/cases/get-for";
    const historyApiUrl = "http://localhost:4000/api/cases/user-history";
    const token = req.headers.authorization.split(" ")[1];

    const command = `python recommender.py "${casesApiUrl}" "${historyApiUrl}" "${token}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
        if (stderr) {
            return res.status(500).json({ success: false, message: "Error in AI processing." });
        }
        try {
            const recommendations = JSON.parse(stdout.replace(/'/g, '"'));
            return res.status(200).json({ success: true, recommendations });
        } catch {
            return res.status(500).json({ success: false, message: "Error parsing recommendations." });
        }
    });
});


export const markNotInterested = async (req, res) => {
    try {
        const { userId, caseIds } = req.body;

        if (!caseIds || caseIds.length === 0) {
            return res.status(400).json({
                message: "No cases provided to mark as not interested.",
            });
        }

        // Update cases to add the userId to the "notInterestedBy" field
        await Case.updateMany(
            { _id: { $in: caseIds } },
            { $addToSet: { notInterestedBy: userId } } // Avoid duplicates
        );

        res.status(200).json({
            message: "Cases marked as not interested successfully.",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error marking cases as not interested.",
            error: error.message,
        });
    }
};
recommendRouter.post('/mark-not-interested', authMiddleware, markNotInterested);




export default recommendRouter;
