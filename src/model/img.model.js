import mongoose from "mongoose";
import { db } from "../loaders/db.loader.js";
const ImgSchema = new mongoose.Schema(
  {
    img_path: { type: String, required: true }, // Cloudinary URL
    alt: { type: String, default: "No description" },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Img = mongoose.model("Img", ImgSchema, "imgs");

export { Img };

