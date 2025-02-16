import express from 'express';
import multer from "multer"; // For image storage system
import {
    addCategory,
    addSubCategory,
    listCategories,
    listSubCategories,
    listItemsBySubcategory,
    listAllSubCategories,
    updateCategory,
    deleteCategory,
    updateSubCategory,
    deleteSubCategory
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

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

// Category routes
categoryRouter.post("/add", upload.single("image"), addCategory);
categoryRouter.delete("/:id", deleteCategory); // Delete category
categoryRouter.get("/", listCategories);
categoryRouter.put("/:id", upload.single("image"), updateCategory); // Update category

// Subcategory routes
categoryRouter.post("/addSub", upload.single("image"), addSubCategory);
categoryRouter.delete("/subcategories/:id", deleteSubCategory); // Delete subcategory
categoryRouter.get("/:categoryId/subcategories", listSubCategories); // List subcategories for a specific category
categoryRouter.get("/subcategories", listAllSubCategories); // List all subcategories
categoryRouter.put("/subcategories/:id", upload.single("image"), updateSubCategory); // Update subcategory

// List items under a specific subcategory
categoryRouter.get("/subcategories/:subcategoryId/items", listItemsBySubcategory);

export default categoryRouter;