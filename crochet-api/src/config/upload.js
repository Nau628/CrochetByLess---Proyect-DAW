// src/config/upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "crochetbyless",
    // opcional: transformar a jpg y limitar tamaño
    format: "jpg",
    transformation: [{ width: 1200, crop: "limit" }]
  })
});

export const upload = multer({ storage });
