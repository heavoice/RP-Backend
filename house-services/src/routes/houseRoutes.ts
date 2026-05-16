import { Router } from "express";

import {
  createHouse,
  getHouses,
  getHouseDetail,
  updateHouse,
  deleteHouse,
} from "../controllers/houseController";

const router = Router();

router.post("/", createHouse);
router.get("/", getHouses);
router.get("/:id", getHouseDetail);
router.put("/:id", updateHouse);
router.delete("/:id", deleteHouse);

export default router;
