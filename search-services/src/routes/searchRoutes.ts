import { Router } from "express";

import { searchHouses } from "../controllers/searchController";

const router = Router();

router.get("/", searchHouses);

export default router;
