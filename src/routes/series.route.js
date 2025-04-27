// import { Router } from "express";
// import { createArticleController, getAllTagController, getAllCategoryController, searchTagByNameController, searchCategoryByNameController, updateArticleController, publishArticleController, getArticlesByCategorySlug, getArticleByIdController, getArticlesByTagSlug, getLatestArticles, getArticleBySlugController, getArticlesByType, getPublishedArticlesByType, saveAsDraftController, getDraftArticlesByType, sendForApprovalController, getArticlesByCategoryAndTypeController, deleteArticleController, updateArticleByIdController, searchArticles, searchArticlesByAuthor, searchArticlesClient } from "../controllers/article.controller.js";
// import { isAdmin, authenticateJWT, checkRole } from '../middleware/auth.middleware.js';
// import { getPendingApprovalPostsController } from "../controllers/admin.controller.js"
// import { getPublishedAllArticles, getAllDraftArticlesByType, getAllPendingApprovalPostsController, searchArticlesByTitle, getUserPendingApprovalPostsController, getLiveArticles } from "../controllers/getAllpost.js";

// const router = Router();


 

// router.get("/posts/published",authenticateJWT, getPublishedArticlesByType);  // end user
// router.post("/posts/draft", saveAsDraftController); 

// router.get("/posts/draft",authenticateJWT,  getDraftArticlesByType);
// router.get("/posts/send-for-approval", authenticateJWT, sendForApprovalController);
// router.get("/posts/pending-approval", authenticateJWT,isAdmin, getPendingApprovalPostsController);

// router.delete("/article/:id", authenticateJWT, deleteArticleController);

// router.route("/article/update/:id").put(authenticateJWT, updateArticleByIdController);



// // get all the posts by type

// router.get("/posts/pending-approval/user", authenticateJWT, getUserPendingApprovalPostsController);    
// router.get("/posts/published/all", getPublishedAllArticles); 
// router.get("/posts/draft/all", authenticateJWT,  getAllDraftArticlesByType);
// router.get("/posts/pending-approval/all", authenticateJWT, checkRole(['Admin', 'Editor']), 
// getAllPendingApprovalPostsController);
// router.get("/posts/live/all", authenticateJWT, getLiveArticles);
// router.get('/posts/search', searchArticlesByTitle);

// router.get('/content/search', searchArticles);
// router.get('/content/search/client', searchArticlesClient);
// router.get('/content/author', searchArticlesByAuthor);

// export default router;
import express from 'express';

import {  authenticateJWT } from '../middleware/auth.middleware.js';
import {getAllSeriesPart,createSeries,getAllSeries,getAllSeriesList, updateSeries, getSingleSeriesPart} from "../controllers/series.controller.js"
const router = express.Router();

// Create Category
router.post('/:parent_id',authenticateJWT, createSeries);
router.put('/update/:id',authenticateJWT, updateSeries);
router.get('/article', getAllSeriesList);
router.get('/:id', getSingleSeriesPart);
// Get All Categories
router.get('/:status/:parent_id',getAllSeriesPart);



export default router;