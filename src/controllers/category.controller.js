import { Category } from "../model/category.model.js";

// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, description, slug } = req.body;

        // Create new category instance
        const category = new Category({
            name,
            description,
            slug
        });

        // Save the category
        await category.save();

        return res.status(201).json({ category });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while creating the category', error });
    }
};

// Get All Categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().exec();
        return res.status(200).json({ categories });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching categories', error });
    }
};

// Get Category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({ _id: id });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ category });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching the category', error });
    }
};

// Update Category by ID
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, slug } = req.body;

        const category = await Category.findOne({_id: id });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Update category fields
        category.name = name || category.name;
        category.description = description || category.description;
        category.slug = slug || category.slug;

        await category.save();

        return res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating the category', error });
    }
};

// Delete Category by ID
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;


        const category = await Category.findByIdAndDelete({_id: id });



        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while deleting the category', error });
    }
};
