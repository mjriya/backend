import express from "express";
import { getRssFeedController } from "../controllers/rss.controller.js";

const router = express.Router();

// RSS Feed Endpoint
router.get("/rss-feed",   getRssFeedController);

export default router;
