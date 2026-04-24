import { Router } from "express";
import { login, verify, refresh } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/verify", verify);
router.post("/refresh", refresh);

export default router;
