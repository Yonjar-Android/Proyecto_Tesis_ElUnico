import { Router } from "express";
import { forgotPassword, login } from "../controllers/loginController.js";

const router = Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);

export default router;
