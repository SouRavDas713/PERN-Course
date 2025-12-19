import { Router } from "express";
import {
  getAllProduct,
  getAProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/product/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";

const router = Router();

router.get("/", getAllProduct);
router.get("/:id", getAProduct);

router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
