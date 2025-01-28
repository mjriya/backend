import express from "express";
import { createNotification } from "../controllers/notification.controller.js";

const router = express.Router();

// Notification Endpoint
router.post("/",createNotification);

export default router;
