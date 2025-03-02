import express from 'express';

import {  authenticateJWT } from '../middleware/auth.middleware.js';
import {getAllSeriesPart,createSeries,getAllSeries,getAllSeriesList} from "../controllers/series.controller.js"
const router = express.Router();

// Create Category
router.post('/',authenticateJWT, createSeries);
router.get('/article', getAllSeriesList);

// Get All Categories
router.get('/:status/:parent_id',getAllSeriesPart);



export default router;
