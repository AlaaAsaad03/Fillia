import express from "express";
import { getProfile, updateProfile, deleteAccount, getProfileForAdmin } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/auth.js";
import multer from 'multer'

const profileRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

profileRouter.get("/get", authMiddleware, getProfile);
profileRouter.get("/:userId/getprofile", getProfileForAdmin);
profileRouter.post("/update", authMiddleware, upload.single("image"), updateProfile);
profileRouter.delete("/remove", authMiddleware, deleteAccount);

export default profileRouter;
