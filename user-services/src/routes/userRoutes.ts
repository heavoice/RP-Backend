import { Router } from "express";
import {
  register,
  findByEmail,
  getUser,
  updateUser,
  addFavoriteHouse,
  getFavoriteHouses,
  removeFavoriteHouse,
} from "../controllers/userController";

const router = Router();

// 🔓 PUBLIC
router.post("/register", register);
router.get("/findByEmail", findByEmail);

// 🔒 PROTECTED (nanti via gateway)
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.post("/favorites", addFavoriteHouse);
router.get("/:id/favorites", getFavoriteHouses);
router.delete("/favorites/:userId/:houseId", removeFavoriteHouse);

export default router;
