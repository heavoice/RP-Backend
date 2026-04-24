import { Router } from "express";
import {
  register,
  findByEmail,
  getUser,
  updateUser,
  getPreferences,
  updatePreferences,
} from "../controllers/userController";

const router = Router();

// 🔓 PUBLIC
router.post("/register", register);
router.get("/findByEmail", findByEmail);

// 🔒 PROTECTED (nanti via gateway)
router.get("/:id", getUser);
router.put("/:id", updateUser);

router.get("/:id/preferences", getPreferences);
router.put("/:id/preferences", updatePreferences);

export default router;
