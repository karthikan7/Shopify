const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/productcontroller");
const { protect, admin } = require("../middleware/authmiddaleware");

// Store file in memory instead of disk or cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", protect, admin, upload.single("image"), createProduct);
router.put("/:id", protect, admin, upload.single("image"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;