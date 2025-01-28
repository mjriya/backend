import express from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { isAdmin, authenticateJWT, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create Category
router.post('/',authenticateJWT, createCategory);

// Get All Categories
router.get('/', authenticateJWT, getCategories);

// Get Category by ID
router.get('/:id', authenticateJWT, getCategoryById);

// Update Category by ID
router.put('/:id', authenticateJWT, updateCategory);

// Delete Category by ID
router.delete('/:id',authenticateJWT, deleteCategory);

export default router;
