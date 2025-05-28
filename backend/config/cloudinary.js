const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pcbuilder/profiles",
    allowed_formats: ["jpg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pcbuilder/posts",
    allowed_formats: ["jpg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

module.exports = { cloudinary, profileStorage, postStorage };
