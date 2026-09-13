const express = require("express");
const auth = require("../middleware/authMiddleware");
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
router.post("/", auth, createResource);
router.put("/:id", auth, updateResource);
router.delete("/:id", auth, deleteResource);
router.post("/:id/download", auth, downloadResource);

module.exports = router;