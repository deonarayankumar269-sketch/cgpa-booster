const multer = require("multer");
const cloudinaryStorageModule = require("multer-storage-cloudinary");
const CloudinaryStorage = cloudinaryStorageModule.CloudinaryStorage || cloudinaryStorageModule.default || cloudinaryStorageModule;
const cloudinaryConfig = require("../config/cloudinary");
// multer-storage-cloudinary v2 expects an object with a .v2 property
const cloudinary = cloudinaryConfig.v2 ? cloudinaryConfig : { v2: cloudinaryConfig };

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cgpa_booster_resources",
    resource_type: "auto",
    allowed_formats: ["pdf", "jpg", "jpeg", "png", "doc", "docx"]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;