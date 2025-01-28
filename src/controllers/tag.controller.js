import { Tag } from "../model/tag.model.js";

// Create a new Tag
export const createTag = async (req, res) => {
    try {
        const { name, description, slug } = req.body;

        // Create a new tag instance
        const tag = new Tag({
            name,
            description,
            slug
        });

        // Save the tag to the database
        await tag.save();

        return res.status(201).json({ tag });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while creating the tag', error });
    }
};

// Get all Tags
export const getTags = async (req, res) => {
    try {
        const tags = await Tag.find().exec();
        return res.status(200).json({ tags });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching tags', error });
    }
};

// Get Tag by ID
export const getTagById = async (req, res) => {
    try {
        const { id } = req.params;

        const tag = await Tag.findOne({_id: id });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        return res.status(200).json({ tag });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching the tag', error });
    }
};

// Update Tag by ID
export const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, slug } = req.body;

        const tag = await Tag.findOne({ _id:id });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        // Update tag fields
        tag.name = name || tag.name;
        tag.description = description || tag.description;
        tag.slug = slug || tag.slug;

        await tag.save();

        return res.status(200).json({ message: 'Tag updated successfully', tag });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating the tag', error });
    }
};

// Delete Tag by ID
export const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        const tag = await Tag.findByIdAndDelete({_id: id });



        return res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while deleting the tag', error });
    }
};
