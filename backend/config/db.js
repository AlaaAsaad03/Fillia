import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://zahraaibrahim666:KUYyYtxFIwPrQGjz@cluster0.d76sz.mongodb.net/food-del').then(() => console.log("DB Connected"));
}