import { Router } from "express";
import multer from "multer";
import {
  uploadMedia,
  getMediaByHouse,
  getProfileMedia,
} from "../controllers/mediaController";

const router = Router();

// Multer configuration to store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

router.post("/upload", upload.single("image"), uploadMedia);
router.get("/houses/:id", getMediaByHouse);
router.get("/profiles/:id", getProfileMedia);

export default router;
