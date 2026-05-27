import { Router } from "express";
import {
  register,
  findByEmail,
  getUser,
  updateUser,
  addFavoriteHouse,
  getFavoriteHouses,
  removeFavoriteHouse,
  getBookings,
  createBooking,
  confirmBooking,
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
router.post("/bookings", createBooking);
router.get("/:userId/bookings", getBookings);
router.patch("/bookings/:id/confirm", confirmBooking);

export default router;
