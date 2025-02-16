import express from 'express';
import mongoose from 'mongoose';
import { execSync } from 'child_process';
import fs from 'fs';
import Case from "../models/caseModel.js";
import path from "path";

const predicLabelRouter = express.Router();
// Python script path
const PYTHON_SCRIPT = 'C:/Users/Lenovo/Desktop/food-del/backend/predictLabel.py';
const MODEL_PATH = "C:/Users/Alaa As'ad/training_model.pkl";


const TEMP_JSON_PATH = path.join(process.cwd(), "temp_cases.json");// Temporary JSON file path
console.log("Temporary JSON file path:", TEMP_JSON_PATH);


// Route to process AI label prediction
predicLabelRouter.post('/predict-labels', async (req, res) => {
    try {
        // Find cases with acceptanceStatus "loading"
        const cases = await Case.find({ acceptanceStatus: 'loading' });

        if (cases.length === 0) {
            return res.status(200).json({ message: 'No cases with acceptanceStatus "loading" found.' });
        }

        // Transform and prepare cases for AI input
        const casesForAI = cases.map(caseData => ({
            title: caseData.title,
            description: caseData.description,
            itemsNeeded: caseData.itemsNeeded.map(item => ({ name: item.name })), // Transform itemsNeeded
            salary: caseData.salary,
            creatorReputationScore: caseData.creatorReputationScore,
            salaryImage_validation: caseData.salaryImageValidation,
            caseTypeImage_validation: caseData.caseTypeImageValidation,
            urgency: caseData.urgency,
            caseType: caseData.caseType,
            targetGroup: caseData.targetGroup,
        }));

        // Save cases to a temporary JSON file
        console.log("Writing cases to:", TEMP_JSON_PATH);
        fs.writeFileSync(TEMP_JSON_PATH, JSON.stringify(casesForAI, null, 2));

        // Execute the Python script
        const command = `python predictLabel.py predict "${MODEL_PATH}" "${TEMP_JSON_PATH}"`;
        const output = execSync(command, { encoding: 'utf-8' });

        // Parse the AI response
        const predictions = JSON.parse(output);

        // Update cases in the database with AI labels
        const updatedCases = [];
        for (const [index, prediction] of predictions.entries()) {
            const caseId = cases[index]._id;
            const label = prediction.label;
            await Case.updateOne({ _id: caseId }, { AiLabel: label });
            updatedCases.push({ caseId, label });
        }

        // Cleanup: remove the temporary file
        fs.unlinkSync(TEMP_JSON_PATH);

        res.status(200).json({ message: 'Predictions completed.', predictions: updatedCases });
    } catch (error) {
        console.error('Error in prediction process:', error);

        // Cleanup: ensure the temporary file is removed
        if (fs.existsSync(TEMP_JSON_PATH)) fs.unlinkSync(TEMP_JSON_PATH);

        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

export default predicLabelRouter;
