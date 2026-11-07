const multer =
  require("multer");

const path =
  require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadRoot = path.join(__dirname, "..", "uploads");
fs.mkdirSync(path.join(uploadRoot, "images"), { recursive: true });
fs.mkdirSync(path.join(uploadRoot, "videos"), { recursive: true });

/* =========================================
   STORAGE
========================================= */

const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        /* IMAGE */

        if (
          file.mimetype.startsWith(
            "image"
          )
        ) {

          cb(
            null,
            path.join(uploadRoot, "images")
          );

        }

        /* VIDEO */

        else if (
          file.mimetype.startsWith(
            "video"
          )
        ) {

          cb(
            null,
            path.join(uploadRoot, "videos")
          );

        }

        else {

          cb(
            new Error(
              "Unsupported file type"
            )
          );
        }
      },

    filename:
      function (
        req,
        file,
        cb
      ) {

        const extensions = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/webp": ".webp",
          "video/mp4": ".mp4",
          "video/webm": ".webm",
          "video/quicktime": ".mov",
        };
        const uniqueName = crypto.randomUUID() + extensions[file.mimetype];

        cb(
          null,
          uniqueName
        );
      },
  });

/* =========================================
   FILE FILTER
========================================= */

const fileFilter =
  (req, file, cb) => {

    const allowed =
      [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp",

        "video/mp4",

        "video/webm",

        "video/quicktime",
      ];

    if (
      allowed.includes(
        file.mimetype
      )
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only images and videos are allowed"
        )
      );
    }
  };

/* =========================================
   UPLOAD
========================================= */

const upload =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize: 25 * 1024 * 1024,
      files: 10,
    },
  });

module.exports =
  upload;
