import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import caseModel from "../models/caseModel.js";
import axios from "axios";

const imageValidationRouter = express.Router();

// Define the uploads directory and Python script path
const pythonScriptPath = path.join(process.cwd(), "imageValidation.py");
const casesJsonPath = path.join(process.cwd(), "cases.json");

// Endpoint to validate images
imageValidationRouter.post("/validateImages", async (req, res) => {
    console.log("Starting /validateImages endpoint"); // Debugging log
    try {
        console.log("Fetching cases from database..."); // Debugging log
        const casesFromDB = await caseModel.find({ acceptanceStatus: "loading" });
        console.log("Cases fetched from database:", casesFromDB.length); // Debugging log

        // Map cases to include sanitized file paths
        const sanitizePath = (fileName) => {
            if (!fileName) return null;
            return `C:\\Users\\Alaa As'ad\\OneDrive\\Desktop\\food-del-Zahraa--main - Copy (6) - Copy\\backend\\uploads\\${fileName}`;
        };

        const cases = casesFromDB.map((c) => ({
            caseId: c._id,
            salaryImage: c.salaryImage ? sanitizePath(c.salaryImage) : null,
            caseTypeImage: c.caseTypeImage ? sanitizePath(c.caseTypeImage) : null,
        }));

        if (cases.length === 0) {
            console.log("No valid cases found with loading status"); // Debugging log
            return res
                .status(404)
                .json({ message: "No valid cases found with loading status" });
        }

        console.log("Saving cases to JSON file..."); // Debugging log
        fs.writeFileSync(casesJsonPath, JSON.stringify(cases, null, 2));
        console.log("Cases saved to JSON file"); // Debugging log

        console.log("Spawning Python process..."); // Debugging log
        const pythonProcess = spawn("python", [pythonScriptPath, casesJsonPath]);

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => {
            const outputString = data.toString();
            console.log("Python stdout:", outputString); // Debugging log

            // Try to parse valid JSON only
            try {
                const parsedOutput = JSON.parse(outputString);
                parsedOutput.forEach((result) => {
                    if (result.caseTypeImage_validation === null) {
                        result.caseTypeImage_validation = "null"; // Ensure consistency in responses
                    }
                });
                output += JSON.stringify(parsedOutput);
            } catch (e) {
                console.log("Non-JSON output from Python:", outputString); // Ignore non-JSON
            }
        });


        pythonProcess.stderr.on("data", (data) => {
            console.error("Python stderr:", data.toString()); // Debugging log
            errorOutput += data.toString();
        });

        pythonProcess.on("error", (err) => {
            console.error("Error spawning Python process:", err); // Debugging log
            return res.status(500).json({
                error: "Error spawning Python process",
                details: err.message,
            });
        });

        pythonProcess.on("close", async (code) => {
            console.log("Python process closed with code:", code); // Debugging log
            if (code !== 0) {
                console.error("Python script error:", errorOutput); // Debugging log
                return res.status(500).json({
                    error: "Python script execution failed",
                    details: errorOutput,
                });
            }

            try {
                console.log("Parsing Python script output..."); // Debugging log
                const results = JSON.parse(output);
                console.log("Parsed results:", results); // Debugging log

                for (const result of results) {
                    const {
                        caseId,
                        salaryImage_validation,
                        caseTypeImage_validation,
                    } = result;
                    console.log(
                        `Updating case: ${caseId} with validation results...`
                    ); // Debugging log
                    await caseModel.findByIdAndUpdate(caseId, {
                        salaryImageValidation: salaryImage_validation ?? null,
                        caseTypeImageValidation: caseTypeImage_validation ?? null,
                    });
                }

                try {
                    const predictResponse = await axios.post(
                        'http://localhost:4000/api/predict/predict-labels',
                        {},
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    console.log('Predict labels process started:', predictResponse.data);
                } catch (predictError) {
                    console.error('Error starting predict-labels process:', predictError.message);
                }

                console.log("Validation process completed successfully"); // Debugging log
                res.json({ message: "Validation completed successfully", results });
            } catch (parseError) {
                console.error("Error parsing Python output:", parseError); // Debugging log
                res
                    .status(500)
                    .json({ error: "Failed to parse Python script output" });
            }
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).json({ error: "Unexpected error occurred" });
    }
});

export default imageValidationRouter;