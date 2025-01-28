import { Schema, model } from "mongoose";
import { mongoose } from "../loaders/db.loader.js";

// Helper function to generate a unique slug
const generateUniqueSlug = async (slug) => {
    let uniqueSlug = slug;
    let count = 1;

    // Check if the slug already exists
    while (await Category.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${count}`;
        count++;
    }

    return uniqueSlug;
};

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true
});

// Ensuring unique slug before saving
CategorySchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('slug')) {
        // If the slug is new or modified, generate a unique slug
        this.slug = await generateUniqueSlug(this.slug);
    }

    if (this.isNew) {
        // Auto-increment the id field for new categories
        const lastCategory = await this.constructor.findOne().sort({ id: -1 });
        this.id = lastCategory ? lastCategory.id + 1 : 1;
    }

    next();
});

CategorySchema.index({
    name: "text"
});

const Category = mongoose.model('Category', CategorySchema, 'categories');

export {
    Category
};
