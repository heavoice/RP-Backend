import { Router } from "express";
import multer from "multer";
import {
  getMediaByHouse,
  getProfileMedia,
  uploadHouseMedia,
  uploadProfileMedia,
} from "../controllers/mediaController";

const router = Router();

// Multer configuration to store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

router.post(
  "/houses/upload",
  upload.single("image"),
  uploadHouseMedia,
);
router.post("/profiles/upload", upload.single("image"), uploadProfileMedia);
router.get("/houses/:id", getMediaByHouse);
router.get("/profiles/:id", getProfileMedia);

export default router;
