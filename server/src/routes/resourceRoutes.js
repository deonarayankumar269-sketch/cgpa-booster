const express = require("express");
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const { resourceValidator } = require("../validators/resourceValidators");
const {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
} = require("../controllers/resourceController");

const router = express.Router();

router.get("/", auth, listResources);
router.get("/:id", auth, getResource);
router.post("/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const fileUrl = req.file.path || req.file.secure_url || req.file.url;
  if (!fileUrl) {
    return res.status(500).json({ message: "Upload done but file URL missing" });
  }
  res.json({ fileUrl });
});
router.post("/", auth, resourceValidator, validate, createResource);
router.put("/:id", auth, resourceValidator, validate, updateResource);
router.delete("/:id", auth, deleteResource);
router.post("/:id/download", auth, downloadResource);

module.exports = router;