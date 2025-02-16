import express from 'express';
import multer from "multer"; // For image storage system
import {
    suggestFood,
    updateSuggestionStatus,
    listSuggestions,
    getUserSuggestions
} from '../controllers/suggestionController.js';
import { authMiddleware } from '../middleware/auth.js';

const suggestionRouter = express.Router();


// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        // Generating a unique filename for each uploaded file
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

// Initializing multer with the specified storage configuration
const upload = multer({ storage: storage });

// Route for suggesting food
suggestionRouter.post('/add', upload.single("image"), authMiddleware, suggestFood);

// Route for updating suggestion status (admin)
suggestionRouter.patch('/update', authMiddleware, updateSuggestionStatus);

// Route for listing suggestions (admin)
suggestionRouter.get('/list', listSuggestions);

suggestionRouter.get("/my-suggestions", authMiddleware, getUserSuggestions);



export default suggestionRouter;