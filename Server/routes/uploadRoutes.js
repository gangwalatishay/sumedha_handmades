const express =
  require("express");

const router =
  express.Router();

const upload =
  require(
    "../middleware/uploadMiddleware"
  );
const auth = require("../middleware/authMiddleware");

const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/* =========================================
   UPLOAD MEDIA
========================================= */

router.post(
  "/",

  auth,
  adminOnly,

  upload.array(
    "media",
    10
  ),

  (req, res) => {

    try {

      const files =
        req.files.map(
          (file) => ({

            url: `/uploads/${file.mimetype.startsWith("image") ? "images" : "videos"}/${file.filename}`,

            type:
              file.mimetype.startsWith(
                "image"
              )

                ? "image"

                : "video",
          })
        );

      res.json(files);

    } catch (err) {

      console.error(err);

      res.status(500).json({

        message:
          "Upload failed",
      });
    }
  }
);

module.exports =
  router;
