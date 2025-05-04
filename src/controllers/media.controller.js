
import { environment } from "../loaders/environment.loader.js";
import { Img } from "../model/img.model.js";
import { uploadImage } from "../lib/upload-image.js";


export const getMediaFileNames = async (req, res) => {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    const data = await uploadImage(image, "mj");
      
    return res.status(200).json({
      url: data?.secure_url,
      public_id: data?.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Error uploading image' });
  }
};




const bucketName = environment.AWS_BUCKET_NAME;

let recentlyUploadedFiles = [];

// Helper function to fetch files from a specific folder
const fetchAllFilesFromFolder = async (prefix, limit, continuationToken) => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
    MaxKeys: limit,
    ContinuationToken: continuationToken || undefined,
  };
  const data = await s3.listObjectsV2(params).promise();
  return data;
};



export const uploadMediaFile = async (req, res) => {
 
  try {
    const file = req.file; // Assuming multer is parsing this
    const alt = req.body.alt; // Retrieve alt text from the request body

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload the file to Cloudinary
    const data = await uploadImage(file, "mj");
   
    
    // Create a new Img document and save it to the database
    const imgDocument = new Img({
      img_path: data?.secure_url,
      alt: alt || "No description",
    });

    await imgDocument.save();

    // Respond with the saved document
    return res.status(200).json({
      message: "Image uploaded successfully",
      imgDocument,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ error: "Error uploading image" });
  }
};


// Fetch images from the 'imgs' collection
export const getImageFileNames = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build a query
    const query = {};


    // Fetch images from the collection with pagination
    const images = await Img.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Count total documents matching the query
    const totalImage = await Img.countDocuments(query);

    res.json({
      images,
      page: parseInt(page),
      total: totalImage,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};


export const searchMediaFile = async (req, res) => {
  try {
    const { alt, limit=8, page=1  } = req.query;
    const skip = (page - 1) * limit;
    // Check if 'alt' is provided
    if (!alt) {
      return res.status(400).json({ message: "Alt text is required" });
    }

    // Search for images by 'alt' field using a case-insensitive regex
    const images = await Img.find({
      alt: { $regex: alt, $options: "i" }, // Case-insensitive search
    }).limit(limit) // Limit the number of results
      .skip(skip)   // Skip documents for pagination
      .sort({ published_at_datetime: -1 });

      const imagesCount = await Img.countDocuments({
        alt: { $regex: alt, $options: "i" }, // Case-insensitive search
      })
      
    // If no images are found, return a 404 response
    if (images.length === 0) {
      return res.status(404).json({ message: "No images found" });
    }

    // Return the matching images
    res.status(200).json({
      images,
      page: parseInt(page),
      total: imagesCount,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error searching images by alt:", error);
    res.status(500).json({ error: "Failed to search images" });
  }
};
