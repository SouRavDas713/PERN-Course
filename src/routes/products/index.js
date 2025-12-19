import { Router } from "express";
import imageRoute from "./imageRoute.js";
import variantRoute from "./variantRoute.js";
import productRoute from "./productRoute.js";

const router = Router();

router.use("/image", imageRoute);
router.use("/variant", variantRoute);
router.use("/", productRoute);

export default router;
