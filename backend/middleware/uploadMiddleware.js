const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const formatAllowedTypes = (allowedMimePrefixes) => {
  const labels = allowedMimePrefixes.map((prefix) =>
    prefix.replace("/", "").replace(/^\w/, (character) => character.toLowerCase()),
  );

  if (labels.length <= 1) {
    return labels[0] || "file";
  }

  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
};

const createUpload = ({
  folder = "reviews",
  maxFileSizeMb = 8,
  resourceType = "image",
  allowedMimePrefixes = ["image/"],
} = {}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder,
      resource_type: resourceType,
    }),
  });

  return multer({
    storage,
    limits: {
      fileSize: maxFileSizeMb * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
      if (
        allowedMimePrefixes.some((prefix) =>
          file?.mimetype?.startsWith(prefix),
        )
      ) {
        callback(null, true);
        return;
      }

      callback(
        new Error(`Only ${formatAllowedTypes(allowedMimePrefixes)} uploads are allowed`),
      );
    },
  });
};

const upload = createUpload();

module.exports = upload;
module.exports.createUpload = createUpload;
