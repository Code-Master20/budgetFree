const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const createUpload = ({ folder = "reviews", maxFileSizeMb = 8 } = {}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder,
      resource_type: "image",
    }),
  });

  return multer({
    storage,
    limits: {
      fileSize: maxFileSizeMb * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
      if (file?.mimetype?.startsWith("image/")) {
        callback(null, true);
        return;
      }

      callback(new Error("Only image uploads are allowed"));
    },
  });
};

const upload = createUpload();

module.exports = upload;
module.exports.createUpload = createUpload;
