// import AWS from "aws-sdk";
// import { v4 as uuidv4 } from "uuid"; // For generating unique file names
import { environment } from "../loaders/environment.loader.js";
import { Img } from "../model/img.model.js";
import { uploadImage } from "../lib/upload-image.js";

// const s3 = new AWS.S3({
//   accessKeyId: environment.AWS_ACCESS_KEY, // Store credentials securely
//   secretAccessKey: environment.AWS_SECRET_KEY,
//   region: environment.AWS_REGION,
// });

// Controller to fetch media file names from S3
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


// // Controller to upload media files to S3
// export const uploadMediaFile = async (req, res) => {
//   try {
//     const file = req.file; // File uploaded via multer

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // Generate unique file name
//     const fileExtension = file.originalname.split(".").pop(); // Get file extension
//     const uniqueFileName = `${uuidv4()}.${fileExtension}`; // e.g., 'random-uuid.jpg'

//     const params = {
//       Bucket: environment.AWS_BUCKET_NAME,
//       Key: `media_files/${uniqueFileName}`, // Define folder and file name
//       Body: file.buffer, // File content
//       ContentType: file.mimetype, // MIME type (image/jpeg, etc.)
//       // ACL: "public-read", // Optional: Make file publicly accessible
//     };

//     const data = await s3.upload(params).promise();

//     res.status(200).json({
//       message: "File uploaded successfully",
//       fileUrl: data.Location, // URL of the uploaded file
//       fileName: `media_files/${uniqueFileName}`,
//     });
//   } catch (error) {
//     console.error("Error uploading media file:", error);
//     res.status(500).json({ error: "Failed to upload media file" });
//   }
// };


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

// Get image file names from S3
// export const getImageFileNames = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, token } = req.query;

//     // Fetch files from S3
//     const [mediaFiles, mediaLibrary] = await Promise.all([
//       fetchAllFilesFromFolder("media_files/", limit, token),
//       fetchAllFilesFromFolder("media_library/", limit, token),
//     ]);

//     // Combine S3 results and cache
//     let allFiles = [
//       ...recentlyUploadedFiles,
//       ...mediaFiles.Contents,
//       ...mediaLibrary.Contents,
//     ];

//     // Sort by LastModified to show recent uploads first
//     allFiles.sort(
//       (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
//     );

//     // Paginate results
//     const startIndex = (page - 1) * limit;
//     const paginatedFiles = allFiles.slice(startIndex, startIndex + limit);

//     res.json({
//       files: paginatedFiles.map((file) => file.Key),
//       nextToken: mediaFiles.NextContinuationToken || mediaLibrary.NextContinuationToken || null,
//       page: parseInt(page),
//       limit: parseInt(limit),
//     });
//   } catch (error) {
//     console.error("Error fetching image files:", error);
//     res.status(500).json({ error: "Failed to fetch image file names" });
//   }
// };


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


// export const searchMediaFile = async (req, res) => {
//   try {
//     const { fileName } = req.query;

//     if (!fileName) {
//       return res.status(400).json({ message: "File name is required" });
//     }

//     const params = {
//       Bucket: bucketName,
//       Prefix: `media_files/${fileName}`, // Search by prefix
//     };

//     const data = await s3.listObjectsV2(params).promise();

//     if (data.Contents.length === 0) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     // Return the file details
//     res.status(200).json({
//       files: data.Contents.map(file => ({
//         Key: file.Key,
//         LastModified: file.LastModified,
//         Size: file.Size,
//       })),
//     });
//   } catch (error) {
//     console.error("Error searching media file:", error);
//     res.status(500).json({ error: "Failed to search media file" });
//   }
// };


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
