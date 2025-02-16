import express from 'express';

import {  authenticateJWT } from '../middleware/auth.middleware.js';
import {getAllSeries,createSeries,getAllSeriesArticle} from "../controllers/series.controller.js"
const router = express.Router();

// Create Category
router.post('/',authenticateJWT, createSeries);

// Get All Categories
router.get('/:status/:id', getAllSeriesArticle);



export default router;
