import userModel from "../models/userModel.js";


const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve user data" });
    }
};




export { getUserById }