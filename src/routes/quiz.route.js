import express from 'express';
import { getAllQuiz,QuizFindByType,QuizFindBySlug } from '../controllers/quiz.controller.js';

const router = express.Router();

// Create Category
router.get('/', getAllQuiz);
router.get('/:Type', QuizFindByType);
router.get('/:Type/:slug', QuizFindBySlug);


export default router;
