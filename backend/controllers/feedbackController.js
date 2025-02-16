import feedbackModel from '../models/feedbackModel.js';

const addFeedback = async (req, res) => {
    const { userId, feedback } = req.body;
    try {
        const newFeedback = new feedbackModel({ userId, feedback });
        await newFeedback.save();
        res.json({ success: true, message: "Feedback added successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error adding feedback" });
    }
};

const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find().populate('userId', 'name email image');
        res.json({ success: true, feedbacks });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching feedbacks" });
    }
};


const deleteFeedback = async (req, res) => {
    const { id } = req.params;
    try {
        await feedbackModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Feedback deleted successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error deleting feedback" });
    }
};

export { addFeedback, getFeedbacks, deleteFeedback };