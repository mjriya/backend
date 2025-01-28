import express from 'express';
import {
    createTag,
    getTags,
    getTagById,
    updateTag,
    deleteTag
} from '../controllers/tag.controller.js';
import { isAdmin, authenticateJWT, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new tag
router.post('/', authenticateJWT, createTag);

// Get all tags
router.get('/', authenticateJWT, getTags);

// Get a tag by ID
router.get('/:id', authenticateJWT, getTagById);

// Update a tag by ID
router.put('/:id', authenticateJWT, updateTag);

// Delete a tag by ID
router.delete('/:id', authenticateJWT, deleteTag);

export default router;
