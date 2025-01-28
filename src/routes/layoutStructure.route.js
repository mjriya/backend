import express from 'express';
import { getLayoutStructure } from '../controllers/layoutStructure.controller.js';
const router = express.Router();

router.get('/',getLayoutStructure);

export default router;
