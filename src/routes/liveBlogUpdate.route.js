// LiveBlogUpdate routes have been removed
import express from "express";
import {
  addLiveBlogUpdate,
  editLiveBlogUpdate,
  deleteLiveBlogUpdate,
  pinLiveBlogUpdate,
  getLiveBlogUpdates,
  getLiveBlogsController
} from "../controllers/liveBlogUpdate.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { getMediaFileNames, uploadMediaFile, getImageFileNames } from "../controllers/media.controller.js";
// import { getArticlesByAuthor, getUserProfile , getArticlesByAuthorStatus} from "../controllers/user.controller.js"
// import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
// const upload = multer({ storage });

// router.post("/media/upload", upload.single("file"), uploadMediaFile);
// // public route 
// router.get("/post/:postId/live-blog/updates", getLiveBlogUpdates);

// Add live blog update
// all are going to be protected routes
router.post("/posts/:postId/live-blog/update", authenticateJWT, addLiveBlogUpdate);

// Edit live blog update
router.patch("/live-blog/update/:updateId", authenticateJWT, editLiveBlogUpdate);

// Delete live blog update
router.delete("/live-blog/update/:updateId", authenticateJWT, deleteLiveBlogUpdate);

// Pin live blog update
router.patch("/live-blog/update/:updateId/pin", authenticateJWT, pinLiveBlogUpdate);


// Route to fetch media file names
router.get("/media",authenticateJWT,  getMediaFileNames);
router.get('/my-posts', authenticateJWT, getArticlesByAuthor);
router.get('/my-posts', authenticateJWT, getArticlesByAuthorStatus);
router.get("/media/img", authenticateJWT, getImageFileNames);
router.route("/liveblogs").get(getLiveBlogsController);

router.get("/user/:id", getUserProfile);

export default router;
