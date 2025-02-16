import userModel from '../models/userModel.js'

const addToCart = async (req, res) => {
    try {


        let userData = await userModel.findById(req.body.userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!Array.isArray(userData.cartData)) {
            userData.cartData = [];
        }

        if (!Array.isArray(req.body.items)) {
            return res.status(400).json({ success: false, message: "Items should be an array" });
        }

        req.body.items.forEach(({ itemId, quantity }) => {
            let quantityToAdd = parseInt(quantity) || 1;

            const itemIndex = userData.cartData.findIndex(item => item.itemId.toString() === itemId);

            if (itemIndex === -1) {
                userData.cartData.push({ itemId, quantity: quantityToAdd });
            } else {
                userData.cartData[itemIndex].quantity += quantityToAdd;
            }
        });

        await userData.save();

        res.json({ success: true, message: "Items added to cart", cartData: userData.cartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error adding to cart" });
    }
};


const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!Array.isArray(userData.cartData)) {
            userData.cartData = [];
        }

        if (!Array.isArray(req.body.items)) {
            return res.status(400).json({ success: false, message: "Items should be an array" });
        }

        req.body.items.forEach(({ itemId, quantity }) => {
            let quantityToRemove = parseInt(quantity) || 1;

            const itemIndex = userData.cartData.findIndex(item => item.itemId.toString() === itemId);

            if (itemIndex !== -1) {
                if (userData.cartData[itemIndex].quantity > quantityToRemove) {
                    userData.cartData[itemIndex].quantity -= quantityToRemove;
                } else {
                    userData.cartData.splice(itemIndex, 1);
                }
            }
        });

        await userData.save();

        res.json({ success: true, message: "Items removed from cart", cartData: userData.cartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error removing from cart" });
    }
};


// Fetch user cart data
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, cartData: userData.cartData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching cart data" });
    }
};

export { addToCart, removeFromCart, getCart };