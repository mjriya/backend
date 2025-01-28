import express from "express";
import { loginUser, createUser, getAllUsersController, deleteUser, updateUser,updateMyProfile, forgotPassword, resetPassword, getUserProfileController, getUserProfileBySlugController, updateUserProfileController } from "../controllers/user.controller.js";

import { authenticateJWT, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllUsersController);

// Login route

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Route to create a new user (admin only)
router.post("/create", createUser);

router.put("/update/:id", updateUser);
router.delete("/delete/:id", authenticateJWT, isAdmin, deleteUser);
router.put("/my-profile/update/:id", authenticateJWT, updateMyProfile);


// Get a specific user's data (accessible to all authenticated users)
router.get("/profile/:slug", getUserProfileBySlugController);

// Update the logged-in user's profile
router.put("/profile/update", authenticateJWT, updateUserProfileController);




export default router;
