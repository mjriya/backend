import express from 'express';
import multer from "multer";
import { getImageFileNames, getMediaFileNames, uploadMediaFile } from '../controllers/media.controller.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Create Category
router.post("/upload", upload.single("file"), uploadMediaFile);
// router.get("/",  getMediaFileNames);
router.get("/img",   getImageFileNames);

export default router;
