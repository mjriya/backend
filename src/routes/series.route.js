
// export default router;
import express from 'express';

import {  authenticateJWT } from '../middleware/auth.middleware.js';
import {getAllSeriesPart,createSeries,getAllSeries,getAllSeriesList, updateSeries, getSingleSeriesPart} from "../controllers/series.controller.js"
const router = express.Router();

// Create Category
router.post('/:parent_id',authenticateJWT, createSeries);
router.put('/update/:id',authenticateJWT, updateSeries);
router.get('/article',authenticateJWT, getAllSeriesList);
router.get('/:id', getSingleSeriesPart);
// Get All Categories
router.get('/:status/:parent_id',getAllSeriesPart);



export default router;