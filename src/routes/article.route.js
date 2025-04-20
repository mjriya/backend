import { Router } from "express";
import { createArticleController, getAllTagController, getAllCategoryController, searchTagByNameController, searchCategoryByNameController, updateArticleController, publishArticleController, getArticlesByCategorySlug, getArticleByIdController, getArticlesByTagSlug, getLatestArticles, getArticleBySlugController, getArticlesByType, getPublishedArticlesByType, saveAsDraftController, getDraftArticlesByType, sendForApprovalController, getArticlesByCategoryAndTypeController, deleteArticleController, updateArticleByIdController, searchArticles, searchArticlesByAuthor, searchArticlesClient } from "../controllers/article.controller.js";
import { isAdmin, authenticateJWT, checkRole } from '../middleware/auth.middleware.js';
import { getPendingApprovalPostsController } from "../controllers/admin.controller.js"
import { getPublishedAllArticles, getAllDraftArticlesByType, getAllPendingApprovalPostsController, searchArticlesByTitle, getUserPendingApprovalPostsController, getLiveArticles } from "../controllers/getAllpost.js";

const router = Router();
router.route("/tag/").get(getAllTagController)
router.route("/category/").get(getAllCategoryController)
router.route("/tag/search").get(searchTagByNameController)
router.route("/category/search").get(searchCategoryByNameController)

router.route("/content/create").post(createArticleController)
router.route("/content/update/:id").put(updateArticleController);
router.route("/content/publish").get(publishArticleController) // end user
router.get("/content/latest-articles", getLatestArticles);  // end user
router.get("/contents/category/:slug", getArticlesByCategorySlug); // end user
router.get("/contents/tags/:slug", getArticlesByTagSlug); // end user
router.get("/contents/type/:type", getArticlesByType);  // end user
router.get("/content/:id", getArticleByIdController);  // end user
router.get("/content/slug/:slug", getArticleBySlugController); // end user

// New route to get articles by category and type
router.get("/content/category/:slug/type/:type", getArticlesByCategoryAndTypeController); // end user
 

router.get("/posts/published",authenticateJWT, getPublishedArticlesByType);  // end user
router.post("/posts/draft", saveAsDraftController); 
router.get("/posts/draft",authenticateJWT,  getDraftArticlesByType);
router.get("/posts/send-for-approval", authenticateJWT, sendForApprovalController);
router.get("/posts/pending-approval", authenticateJWT,isAdmin, getPendingApprovalPostsController);

router.delete("/article/:id", authenticateJWT, deleteArticleController);

router.route("/article/update/:id").put(authenticateJWT, updateArticleByIdController);



// get all the posts by type

router.get("/posts/pending-approval/user", authenticateJWT, getUserPendingApprovalPostsController);    
router.get("/posts/published/all", getPublishedAllArticles); 
router.get("/posts/draft/all", authenticateJWT,  getAllDraftArticlesByType);
router.get("/posts/pending-approval/all", authenticateJWT, checkRole(['Admin', 'Editor']), 
getAllPendingApprovalPostsController);
router.get("/posts/live/all", authenticateJWT, getLiveArticles);
router.get('/posts/search', searchArticlesByTitle);

router.get('/content/search', searchArticles);
router.get('/content/search/client', searchArticlesClient);
router.get('/content/author', searchArticlesByAuthor);

export default router;
