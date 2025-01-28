

// import { db } from "../loaders/db.loader.js";
// // Import your models
import { Article } from "../model/articel.model.js";
import { Category } from "../model/category.model.js";
import { Tag } from "../model/tag.model.js";
import { User } from "../model/user.model.js";
import { Img } from "../model/img.model.js";
// import { LiveBlogUpdate } from "../model/ liveBlogUpdate.model.js";
// import bcrypt from "bcrypt";
// async function migrateBannerToImages() {
//   try {
//     // console.log("hey")
//     // Connect to database if not connected

//     // Fetch all articles with banner_image and banner_desc
//     const articles = await Article.find({
//       banner_image: { $exists: true, $ne: null, $ne: "" },
//       banner_desc: { $exists: true, $ne: null, $ne: "" }
//     });
//     console.log(`Found ${articles.length} articles`);
//     // console.log("articles: ", articles)
//     console.log("hee: ", articles.banner_image)

//     // Transform and save to imgs collection
//     const imgDocuments = articles.map(article => ({
//       img_path: article.banner_image,
//       alt: article.banner_desc,
//     }));

//     // Insert into Img collection
//     await Img.insertMany(imgDocuments);

//     console.log("Migration completed successfully!");
//   } catch (error) {
//     console.error("Error during migration:", error);
//   }
// }

// export { migrateBannerToImages };
async function migrateSocialProfiles() {
  try {
    const allAuthors = await User.find();

    for (const author of allAuthors) {
      // Check if social_profiles is an array and convert it to an object
      if (Array.isArray(author.social_profiles)) {
        const [facebook, twitter, linkedin] = author.social_profiles;
        await User.findByIdAndUpdate(author._id, {
          $set: {
            social_profiles: {
              facebook: facebook || null,
              twitter: twitter || null,
              linkedin: linkedin || null,
            },
          },
        });
      }
    }

    console.log("All users updated successfully!");
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

export { migrateSocialProfiles };