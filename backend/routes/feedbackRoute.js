import express from 'express';
import { addFeedback, getFeedbacks, deleteFeedback } from '../controllers/feedbackController.js';
import {authMiddleware} from "../middleware/auth.js"

const feedbackRouter = express.Router();

feedbackRouter.post('/add', authMiddleware, addFeedback);
feedbackRouter.get('/all', getFeedbacks); // No auth to allow both user and admin access
feedbackRouter.delete('/delete/:id', deleteFeedback);

export default feedbackRouter;