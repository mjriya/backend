import { Article } from "../model/articel.model.js";
import { Category } from "../model/category.model.js";
import { Stories } from "../model/sortStroise.js";
import { Tag } from "../model/tag.model.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";


export const createArticleController = async (req, res, next) => {
    const requestedData = req.body;
    const { content } = req.query;
    try {
        const { oldId } = requestedData;


        if (content === 'content') {
            if (oldId) {
                // If oldId exists, find the article with the same oldId
                const existingArticle = await Article.findOne({ oldId });

                if (existingArticle) {
                    // Update the existing article with new data
                    Object.assign(existingArticle, requestedData);
                    const article = await existingArticle.save();
                    return res.status(200).json({ article });
                }
            }

            // If no oldId found or no match in the database, create a new article
            const newArticle = new Article(requestedData);
            const article = await newArticle.save();
            return res.status(200).json({ article });
        }

        if (content === 'stories') {
            if (oldId) {
                // If oldId exists, find the article with the same oldId
                const existingArticle = await Stories.findOne({ oldId });

                if (existingArticle) {
                    // Update the existing article with new data
                    Object.assign(existingArticle, requestedData);
                    const article = await existingArticle.save();
                    return res.status(200).json({ article });
                }
            }

            // If no oldId found or no match in the database, create a new article
            const newArticle = new Stories(requestedData);
            const article = await newArticle.save();
            return res.status(200).json({ article });
        }
    } catch (err) {
        console.error("Error in createArticleController:", err);
        next(err);
    }
};


export const getAllTagController = async (req, res, next) => {
    try {
        const tags = await Tag.find();
        return res.status(200).json({ tags });
    } catch (err) {
        next(err);
    }
};

export const getAllCategoryController = async (req, res, next) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ categories });
    } catch (err) {
        next(err);
    }
};

export const searchTagByNameController = async (req, res, next) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Tag name is required" });
        }

        const tag = await Tag.findOne({ name: new RegExp(name, 'i') });
        if (!tag) {
            return res.status(404).json({ message: "Tag not found" });
        }

        return res.status(200).json({ tag });
    } catch (err) {
        console.log("err: ", err);
        next(err);
    }
};

export const searchCategoryByNameController = async (req, res, next) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const category = await Category.findOne({ name: new RegExp(name, 'i') });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({ category });
    } catch (err) {
        console.log("err: ", err);
        next(err);
    }
};

export const updateArticleController = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.query;
        const updateData = req.body;


        // Validate the update data
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Update data is required" });
        }
        if (content === "stories") {
            const updatedArticle = await Stories.findByIdAndUpdate(id, updateData, {
                new: true, // Return the updated document
                runValidators: true, // Run validation on update
            });

            // Check if the article was found and updated
            if (!updatedArticle) {
                return res.status(404).json({ message: "Article not found" });
            }

            res.status(200).json({ article: updatedArticle });


        } else {
            const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
                new: true, // Return the updated document
                runValidators: true, // Run validation on update
            });

            // Check if the article was found and updated
            if (!updatedArticle) {
                return res.status(404).json({ message: "Article not found" });
            }

            res.status(200).json({ article: updatedArticle });
        }
        // Update the article and return the updated data

    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ message: "An error occurred while updating the article", error: error.message });
    }
};

export const publishArticleController = async (req, res) => {
    try {
        // Get the limit and page from query parameters, with default values
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit is 10
        const page = parseInt(req.query.page, 10) || 1;    // Default page is 1

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Query articles with published_at_datetime and apply pagination
        const articles = await Article.find({
            published_at_datetime: { $ne: null } // Only published articles
        })
            .populate("primary_category", "name slug") // Populate primary category
            .populate("categories", "name slug")       // Populate secondary categories
            .populate("tags", "name slug")             // Populate tags
            .populate("author", "name email social_profiles profile_picture") // Populate author details
            .populate("credits", "name email social_profiles profile_picture") // Populate credits details
            .limit(limit) // Limit the number of results
            .skip(skip)   // Skip documents for pagination
            .sort({ published_at_datetime: -1 }); // Optional: sort by publish date (descending)

        // Count the total number of articles matching the query (for pagination metadata)
        const totalCount = await Article.countDocuments({
            published_at_datetime: { $ne: null }
        });

        // Send the response with articles and pagination info
        res.status(200).json({
            articles,
            pagination: {
                total: totalCount,       // Total number of articles
                limit,                   // Number of articles per page
                currentPage: page,       // Current page
                totalPages: Math.ceil(totalCount / limit) // Total number of pages
            }
        });
    } catch (error) {
        // Handle errors gracefully
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getArticlesByCategorySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { limit = 10, page = 1 } = req.query;

        // Validate limit and page
        const limitValue = Math.max(Number(limit), 1); // Ensure limit is at least 1
        const pageValue = Math.max(Number(page), 1);   // Ensure page is at least 1

        // Find the category by its slug
        const category = await Category.findOne({ slug });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Fetch articles that have a published_at_datetime and belong to the category
        const articles = await Article.find({
            primary_category: category._id,
            published_at_datetime: { $ne: null }, // Ensure `published_at_datetime` is not null
        })
            .populate("primary_category", "name slug") // Populate primary category
            .populate("categories", "name slug")       // Populate secondary categories
            .populate("tags", "name slug")             // Populate tags
            .populate("author", "name email social_profiles profile_picture")          // Populate author details
            .populate("credits", "name email social_profiles profile_picture")         // Populate credits details
            .sort({ published_at_datetime: -1 })       // Sort by latest `published_at_datetime`
            .skip((pageValue - 1) * limitValue)        // Skip documents for pagination
            .limit(limitValue);                        // Limit the number of documents

        // Get the total count of articles with a `published_at_datetime` for the category
        const totalArticles = await Article.countDocuments({
            primary_category: category._id,
            published_at_datetime: { $ne: null }, // Ensure `published_at_datetime` is not null
        });

        res.status(200).json({
            articles,
            pagination: {
                total: totalArticles,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalArticles / limitValue),
            },
        });
    } catch (error) {
        console.error("Error fetching articles by category slug:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getArticleByIdController = async (req, res) => {
    try {
        const { id } = req.params; // Get the article ID from the URL parameters
        const { content } = req.query;
        if (content === "content") {
            const article = await Article.findById(id)
                .populate("primary_category", "name slug") // Populate primary category
                .populate("categories", "name slug")
                .populate("tags", "name slug")
                .populate("author", "name email social_profiles profile_picture")
                .populate("credits", "name email social_profiles profile_picture");

            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }
            res.status(200).json({ article });
        }

        if (content === "stories") {
            const article = await Stories.findById(id)
                .populate("primary_category", "name slug") // Populate primary category
                .populate("categories", "name slug")
                .populate("tags", "name slug")
                .populate("author", "name email social_profiles profile_picture")
                .populate("credits", "name email social_profiles profile_picture");

            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }
            res.status(200).json({ article });
        }

    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving the article", error: error.message });
    }
};

export const getArticlesByTagSlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { limit = 10, page = 1 } = req.query;

        // Validate limit and page
        const limitValue = Math.max(Number(limit), 1); // Ensure limit is at least 1
        const pageValue = Math.max(Number(page), 1);   // Ensure page is at least 1

        // Find the tag by its slug
        const tag = await Tag.findOne({ slug });

        if (!tag) {
            return res.status(404).json({ message: "Tag not found" });
        }

        // Fetch articles with populated references
        const articles = await Article.find({
            tags: tag._id,
            published_at_datetime: { $ne: null }, // Ensure `published_at_datetime` is not null
        })
            .populate("primary_category", "name slug") // Populate primary category
            .populate("categories", "name slug")       // Populate secondary categories
            .populate("tags", "name slug")             // Populate tags
            .populate("author", "name email social_profiles profile_picture")          // Populate author details
            .populate("credits", "name email social_profiles profile_picture")         // Populate credits details
            .sort({ published_at_datetime: -1 })       // Sort by latest `published_at_datetime`
            .skip((pageValue - 1) * limitValue)        // Skip documents for pagination
            .limit(limitValue);                        // Limit the number of documents

        // Get the total count of articles with a `published_at_datetime` for the tag
        const totalArticles = await Article.countDocuments({
            tags: tag._id,
            published_at_datetime: { $ne: null }, // Ensure `published_at_datetime` is not null
        });

        res.status(200).json({
            articles,
            pagination: {
                total: totalArticles,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalArticles / limitValue),
            },
        });
    } catch (error) {
        console.error("Error fetching articles by tag slug:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getLatestArticles = async (req, res) => {
    try {
        const { excludeId } = req.query;

        // Build the base query
        const query = {
            published_at_datetime: { $ne: null }, // Ensure only published articles are included
        };

        // Add the `_id` exclusion condition if a valid `excludeId` is provided
        if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
            query._id = { $ne: excludeId };
        }

        // Fetch the latest articles
        const articles = await Article.find(query)
            .populate("primary_category", "name slug") // Populate primary category
            .populate("categories", "name slug")       // Populate secondary categories
            .populate("tags", "name slug")             // Populate tags
            .populate("author", "name email social_profiles profile_picture") // Populate author details
            .populate("credits", "name email social_profiles profile_picture") // Populate credits details
            .sort({ published_at_datetime: -1 }) // Sort by latest `published_at_datetime`
            .limit(4); // Fetch only 4 articles

        // Return the response
        res.status(200).json({ articles });
    } catch (error) {
        console.error("Error fetching latest articles:", error.message);
        res.status(500).json({ message: "An error occurred while retrieving the articles", error: error.message });
    }
};

export const getArticleBySlugController = async (req, res) => {
    try {
        const { slug } = req.params;

        // Find the article by slug
        const article = await Article.findOne({ slug })
            .populate("primary_category", "name slug")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .populate("author", "name email social_profiles profile_picture slug")
            .populate("credits", "name email social_profiles profile_picture slug")
            .populate({
                path: "live_blog_updates",
                options: { sort: { createdAt: -1 } }, // Sort live_blog_updates by createdAt in descending order
            });

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        let latestArticles = await Article.find({
            $or: [
                { tags: { $in: article.tags.map(tag => tag._id) } },
                { primary_category: article.primary_category._id }
            ],
            _id: { $ne: article._id.toString() }, // Convert _id to a string for comparison
            slug: { $ne: slug }, // Ensure the slug is not the same
            published_at_datetime: { $ne: null } // Ensure the article is published
        })
            .sort({ published_at_datetime: -1 })
            .limit(5)
            .populate("primary_category", "name slug")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .populate("author", "name email social_profiles profile_picture")
            .populate("credits", "name email social_profiles profile_picture")
            .populate({
                path: "live_blog_updates",
                options: { sort: { createdAt: -1 } }
            });

        // Fallback to other articles if no latest articles found
        if (latestArticles.length === 0) {
            latestArticles = await Article.find({
                _id: { $ne: article._id.toString() },
                slug: { $ne: slug },
                published_at_datetime: { $ne: null }
            })
                .sort({ published_at_datetime: -1 })
                .limit(5)
                .populate("primary_category", "name slug")
                .populate("categories", "name slug")
                .populate("tags", "name slug")
                .populate("author", "name email social_profiles profile_picture")
                .populate("credits", "name email social_profiles profile_picture")
                .populate({
                    path: "live_blog_updates",
                    options: { sort: { createdAt: -1 } }
                });
        }

        res.status(200).json({ article, latestArticles });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving the article", error: error.message });
    }
};


export const getArticlesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { limit = 10, page = 1 } = req.query;

        // Validate limit and page
        const limitValue = Math.max(Number(limit), 1); // Ensure limit is at least 1
        const pageValue = Math.max(Number(page), 1);   // Ensure page is at least 1

        // Fetch articles by type
        const articles = await Article.find({
            type, // Assuming 'type' is a field in your Article model
            published_at_datetime: { $ne: null }, // Ensure `published_at_datetime` is not null
        })
            .populate("primary_category", "name slug") // Populate primary category
            .populate("categories", "name slug")       // Populate secondary categories
            .populate("tags", "name slug")             // Populate tags
            .populate("author", "name email social_profiles profile_picture") // Populate author details
            .populate("credits", "name email social_profiles profile_picture") // Populate credits details
            .populate("live_blog_updates")
            .sort({ published_at_datetime: -1 })       // Sort by latest `published_at_datetime`
            .skip((pageValue - 1) * limitValue)        // Skip documents for pagination
            .limit(limitValue);                        // Limit the number of documents

        // Get the total count of articles with a `published_at_datetime` for the type
        const totalArticles = await Article.countDocuments({
            type,
            published_at_datetime: { $ne: null }, // Ensure `published_at_datetime` is not null
        });

        res.status(200).json({
            articles,
            pagination: {
                total: totalArticles,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalArticles / limitValue),
            },
        });
    } catch (error) {
        console.error("Error fetching articles by type:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getPublishedArticlesByType = async (req, res) => {
    try {
        const { langue, limit = 10, page = 1, content } = req.query;

        const limitValue = Math.max(Number(limit), 1);
        const pageValue = Math.max(Number(page), 1);

        let query = { status: "published" };
        if (langue) query.langue = langue;

        if (!["content", "stories"].includes(content)) {
            return res.status(400).json({ message: "Invalid content type provided." });
        }

        const model = content === "content" ? Article : Stories;
        const selectFields = content === "content" ? "-content" : "-web_story";

        const [articles, totalArticles] = await Promise.all([
            model.find(query)
                .select(selectFields)
                .populate("primary_category", "name slug")
                .populate("categories", "name slug")
                .populate("tags", "name slug")
                .populate("author", "name email social_profiles profile_picture")
                .populate("credits", "name email social_profiles profile_picture")
                .sort({ published_at_datetime: -1 })
                .skip((pageValue - 1) * limitValue)
                .limit(limitValue),
            model.countDocuments(query)
        ]);

        res.status(200).json({
            articles,
            pagination: {
                total: totalArticles,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalArticles / limitValue),
            },
        });
    } catch (error) {
        console.error("Error fetching published articles by type:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



export const saveAsDraftController = async (req, res) => {
    try {
        const requestedData = req.body;
        const { content } = req.query

        if (content === "content") {
            const newArticle = new Article({
                ...requestedData,
                author: req.user.userId, // Assuming `id` is the user's identifier
                status: "draft",
                published_at_datetime: null

            });
            const article = await newArticle.save();
            return res.status(201).json({ article });
        }
        if (content === "stories") {
            const newArticle = new Stories({
                ...requestedData,
                author: req.user.userId, // Assuming `id` is the user's identifier
                status: "draft",
                published_at_datetime: null

            });
            const article = await newArticle.save();
            return res.status(201).json({ article });
        }


    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', error });
    }
};

export const getDraftArticlesByType = async (req, res) => {
    try {
        const { langue, page = 1, limit = 10, content } = req.query;

        const limitValue = Math.max(Number(limit), 1);
        const pageValue = Math.max(Number(page), 1);
        const skip = (pageValue - 1) * limitValue;

        if (!["content", "stories"].includes(content)) {
            return res.status(400).json({ message: "Invalid content type provided." });
        }

        const query = { status: "draft" };
        if (langue) query.langue = langue;

        const model = content === "content" ? Article : Stories;
        const selectFields = content === "content" ? "-content" : "-web_story";

        const [articles, totalCount] = await Promise.all([
            model.find(query)
                .select(selectFields)
                .populate("primary_category", "name slug")
                .populate("credits", "name email social_profiles profile_picture")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limitValue),
            model.countDocuments(query)
        ]);

        return res.status(200).json({
            articles,
            pagination: {
                page: pageValue,
                limit: limitValue,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitValue),
            },
        });
    } catch (error) {
        console.error("Error fetching draft articles:", error.message);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching draft articles",
            error: error.message,
        });
    }
};



export const sendForApprovalController = async (req, res) => {
    try {
        const { articleId } = req.query; // Extract articleId from query parameters

        // Assuming you have a method to find the article by ID and update its status
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        article.status = 'pending_approval'; // Update the status to 'pending_approval'
        await article.save();

        return res.status(200).json({ article });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', error });
    }
};

export const getArticlesByCategoryAndTypeController = async (req, res) => {
    const { slug, type } = req.params;
    const { limit = 10, page = 1 } = req.query; // Default limit is 10, page is 1

    try {
        // Find the category by its slug
        const category = await Category.findOne({ slug });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Validate limit and page
        const limitValue = Math.max(Number(limit), 1); // Ensure limit is at least 1
        const pageValue = Math.max(Number(page), 1);   // Ensure page is at least 1

        // Fetch articles that match the category and type
        const articles = await Article.find({
            primary_category: category._id,
            type, // Assuming 'type' is a field in your Article model
            published_at_datetime: { $ne: null } // Ensure `published_at_datetime` is not null
        })
            .populate("primary_category", "name slug") // Populate primary category
            .populate("categories", "name slug")       // Populate secondary categories
            .populate("tags", "name slug")             // Populate tags
            .populate("author", "name email social_profiles profile_picture") // Populate author details
            .populate("credits", "name email social_profiles profile_picture") // Populate credits details
            .sort({ published_at_datetime: -1 })       // Sort by latest `published_at_datetime`
            .skip((pageValue - 1) * limitValue)        // Skip documents for pagination
            .limit(limitValue);                        // Limit the number of documents

        // Get the total count of articles with a `published_at_datetime` for the category and type
        const totalArticles = await Article.countDocuments({
            primary_category: category._id,
            type,
            published_at_datetime: { $ne: null }
        });

        res.status(200).json({
            articles,
            pagination: {
                total: totalArticles,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalArticles / limitValue),
            },
        });
    } catch (error) {
        console.error("Error fetching articles by category and type:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const deleteArticleController = async (req, res) => {
    const { id } = req.params;
    const { content } = req.query;

    try {
        if (content === 'content') {
            const article = await Article.findByIdAndDelete(id);
            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }
            res.status(200).json({ message: "Article deleted successfully" });
        }
        if (content === 'stories') {
            const article = await Stories.findByIdAndDelete(id);
            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }
            res.status(200).json({ message: "Article deleted successfully" });
        }

    } catch (error) {
        console.error("Error deleting article:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const updateArticleByIdController = async (req, res) => {
    const { id } = req.params; // Get the article ID from request parameters
    const updateData = req.body; // Get the update data from request body

    try {
        // Find the article by ID and update it with the new data
        const article = await Article.findByIdAndUpdate(id, updateData, { new: true });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        return res.status(200).json({ message: 'Article updated successfully', article });
    } catch (error) {
        console.error("Error updating article:", error.message);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


export const searchArticles = async (req, res) => {
    try {
        const { title, type, status, page = 1, limit = 10 } = req.query;

        // Build query object
        let query = {};

        if (title && title.trim() !== "") {
            query.title = { $regex: title, $options: 'i' }; // Case-insensitive title search
        }

        if (type === 'bengali') {
            query.type = { $in: ['bengali'] };
        } else if (type) {
            query.type = type;
        }

        if (status === 'published') {
            query.published_at_datetime = { $ne: null };
            query.status = { $ne: "draft" };
        } else if (status === 'draft') {
            query.status = 'draft';
        } else if (status === 'pending-approval') {
            query.status = { $in: ['send-for-approval', 'pending-approval', 'pending_approval'] };
        }

        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const skip = (parsedPage - 1) * parsedLimit;

        const content = await Article.find(query)
            .populate("primary_category", "name slug")
            .populate("categories", "name slug")
            .populate("author", "name email social_profiles profile_picture")
            .populate("credits", "name email social_profiles profile_picture")
            .populate("live_blog_updates")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .exec();

        const totalCount = await Article.countDocuments(query);

        return res.status(200).json({
            articles: content,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / parsedLimit),
            },
        });
    } catch (error) {
        console.error("Error fetching articles:", error);
        return res.status(500).json({ message: 'An error occurred while searching for articles' });
    }
};


export const searchArticlesClient = async (req, res) => {
    try {
        const { title, type, status, page = 1, limit = 10 } = req.query;

        // Build query object
        let query = { published_at_datetime: { $ne: null } };

        if (title && title.trim() !== "") {
            query.title = { $regex: title, $options: 'i' }; // Case-insensitive title search
        }

        if (type === 'Article') {
            query.type = { $in: ['Article', 'article'] };
        } else if (type) {
            query.type = type;
        }

        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const skip = (parsedPage - 1) * parsedLimit;

        const articles = await Article.find(query)
            .populate("primary_category", "name slug")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .populate("author", "name email social_profiles profile_picture")
            .populate("credits", "name email social_profiles profile_picture")
            .populate("live_blog_updates")
            .sort({ published_at_datetime: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .exec();

        const totalCount = await Article.countDocuments(query);

        return res.status(200).json({
            articles,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / parsedLimit),
            },
        });
    } catch (error) {
        console.error("Error fetching articles:", error);
        return res.status(500).json({ message: 'An error occurred while searching for articles' });
    }
};





export const searchArticlesByAuthor = async (req, res, next) => {
    const { authorId, page = 1, limit = 10 } = req.query;

    try {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const skip = (parsedPage - 1) * parsedLimit;

        const articles = await Article.find({ credits: { $in: [authorId] }, published_at_datetime: { $ne: null } })
            .populate("primary_category", "name slug")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .populate("author", "name email social_profiles profile_picture")
            .populate("credits", "name email social_profiles profile_picture")
            .populate("live_blog_updates")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .exec();

        const totalCount = await Article.countDocuments({ credits: { $in: [authorId] }, published_at_datetime: { $ne: null } });


        return res.status(200).json({
            articles,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / parsedLimit),
            },
        });
    } catch (err) {
        console.error("Error searching articles by author:", err);
        next(err);
    }
};
