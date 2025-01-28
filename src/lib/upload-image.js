import cloudinaryV2 from './cloudinary.js';

export const uploadImage = async (file, folder) => {
    const buffer = await file.buffer; // Multer provides a buffer for file content
    const bytes = Buffer.from(buffer);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryV2.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: folder,
            },
            (err, result) => {
                if (err) {
                    console.error("Error during Cloudinary upload:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(bytes);
    });
};
export const deleteImage = async (public_id) => {
    return new Promise((resolve, reject) => {
        cloudinaryV2.uploader.destroy(public_id, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};
