import { Article } from '../model/articel.model.js';
import { Customize } from '../model/customize.model.js';
import { Stories } from '../model/sortStroise.js';
import { User } from '../model/user.model.js';
export const publishPostController = async (req, res) => {


    try {
        const { id } = req.params;

        // Find the article by _id
        const article = await Article.findOne({ _id: id }).select("-content")
            .populate("primary_category", "name slug")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .populate("author", "name email social_profiles profile_picture")
            .populate("credits", "name email social_profiles profile_picture")
            

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Check if there's an existing article with the same oldId
        if (article.oldId) {
            const existingArticle = await Article.findOne({ _id: article.oldId });
            if (existingArticle) {
                // Delete the existing article with the same oldId
                await Article.deleteOne({ _id: existingArticle._id });
            }

            // Create a new document with oldId as _id
            const newArticleData = {
                ...article.toObject(), // Get all fields of the current article
                _id: article.oldId,   // Assign the oldId as the new _id
                published_at_datetime: req.body.published_at_datetime || new Date(),
                status: "published",
            };
            delete newArticleData.oldId; // Remove the oldId field if not needed

            const newArticle = new Article(newArticleData);
            await newArticle.save();

            // Delete the old article with the current _id
            await Article.deleteOne({ _id: article._id });

            // Regenerate the sitemap if required
            // await generateNewsSitemap();

            return res.status(200).json({ message: 'Article published successfully', article: newArticle });
        }

        // If no oldId, simply update and save the article
        article.published_at_datetime = new Date();
        article.status = "published";
        await article.save();

        // Regenerate the sitemap if required
        // await generateNewsSitemap();

        return res.status(200).json({ message: 'Article published successfully', article });
    } catch (error) {
        console.error('Error in publishing article:', error);
        return res.status(500).json({ message: 'An error occurred', error });
    }
};



export const getPendingApprovalPostsController = async (req, res) => {
 
    try {
      const { langue, page = 1, limit = 10, content } = req.query;
  
      const limitValue = Math.max(Number(limit), 1);
      const pageValue = Math.max(Number(page), 1);
      const skip = (pageValue - 1) * limitValue;
  
      if (!["content", "stories"].includes(content)) {
        return res.status(400).json({ message: "Invalid content type provided." });
      }
  
      const query = { status: "pending_approval" };
      if (langue) query.langue = langue;
  
      const model = content === "content" ? Article : Stories
      const selectFields = content === "content" ? "-content" : "-web_story";
  
      const [articles, totalCount] = await Promise.all([
        model.find(query)
          .select(selectFields)
          .populate("primary_category", "name slug")
          .populate("categories", "name slug")
          .populate("tags", "name slug")
          .populate("author", "name email social_profiles profile_picture")
          .populate("credits", "name email social_profiles profile_picture")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitValue),
        model.countDocuments(query),
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
      console.error("Error fetching pending approval posts:", error.message);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching pending approval posts",
        error: error.message,
      });
    }
  };
  


export const unpublishPostController = async (req, res) => {
    
    try {
        const { id } = req.params; // Get MongoDB _id from request parameters

        // Find the article by _id
        const article = await Article.findOne({ _id: id });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Set the published_at_datetime to null
        article.published_at_datetime = null;
        await article.save();

        return res.status(200).json({ message: 'Article unpublished successfully', article });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', error });
    }
};

export const goLiveController = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the article by ID
        const article = await Article.findById(id);

        // Check if the article exists and is published
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        if (!article.published_at_datetime) {
            return res.status(400).json({ message: "Article must be published to go live" });
        }

        // Set the article to live
        article.isLive = true;
        await article.save();

        return res.status(200).json({ message: "Article is now live", article });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};

export const stopLiveController = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the article by ID
        const article = await Article.findById(id);

        // Check if the article exists
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Set the article to not live
        article.isLive = false;
        await article.save();

        return res.status(200).json({ message: "Article is no longer live", article });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};


export const checkingController = async (req, res) => {
    try {

        const userId = req.user.userId; // retrieved from the JWT payload



        // Fetch the user using userId and lean to return plain JavaScript object
        const user = await User.findOne({ _id: userId }).lean();

        // If no user is found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};




export const customizeController = async (req, res) => {
    try {
        // Check if there's an existing item in the schema
        const existingCustomization = await Customize.findOne();

        if (existingCustomization) {
            // If there's an existing item, update it (PUT behavior)
            const updatedCustomization = await Customize.findByIdAndUpdate(
                existingCustomization._id,
                req.body,
                { new: true } // Return the updated document
            );

            return res.status(200).json({
                message: "Customization updated successfully",
                data: updatedCustomization,
            });
        } else {
            // If no items exist, create a new one (POST behavior)
            const newCustomization = new Customize(req.body);
            await newCustomization.save();

            return res.status(201).json({
                message: "Customization created successfully",
                data: newCustomization,
            });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error processing request", error: error.message });
    }
};


