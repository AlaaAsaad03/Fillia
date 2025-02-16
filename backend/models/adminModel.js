import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ['Leader', 'Packager', 'Delivery'], required: true },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now, },
    isVerified: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    googleId: { type: String, unique: true, sparse: true },
}, { minimize: false });

const adminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

// Function to seed the database with initial data
// const seedAdmins = async () => {
//     const admins = [
//         { name: "Zahraa Ibrahim", email: "zahraaibrahim666@gmail.com", password: "Zahraa@123", role: "Leader" },
//         { name: "Alaa Asaad", email: "10121762@mu.edu.lb", password: "Alaa@123", role: "Leader" },
//         { name: "Ahmad Fadel", email: "10121786@mu.edu.lb", password: "Z514360?", role: "Delivery" },
//         { name: "Saaed Wehbi", email: "zahraaibrahim003@gmail.com", password: "Zahraa@work1", role: "Delivery" },
//         { name: "Sarah Saleh", email: "alaasad2003@gmail.com", password: "alaasad@123", role: "Packager" },
//         { name: "Adam Foz", email: "Adam@gmail.com", password: "Adam@123", role: "Packager" },
//         { name: "Yehya Jamal", email: "yehya@gmail.com", password: "Yehya@123", role: "Packager" }
//     ];

//     for (const admin of admins) {
//         const existingAdmin = await adminModel.findOne({ email: admin.email });
//         if (!existingAdmin) {
//             const salt = await bcrypt.genSalt(10);
//             admin.password = await bcrypt.hash(admin.password, salt);
//             await new adminModel(admin).save();
//         }
//     }
// };

// seedAdmins();

export default adminModel;