import { Router } from "express";
import {
  UserSignIn,
  UserSignUp,
  getCurrentUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();
router
  .post("/sign-up", UserSignUp)
  .post("/sign-in", UserSignIn)
  .get("/me", authMiddleware, getCurrentUser);

export default router;
