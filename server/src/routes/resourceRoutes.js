const express = require("express");
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
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
router.post("/", auth, resourceValidator, validate, createResource);
router.put("/:id", auth, resourceValidator, validate, updateResource);
router.delete("/:id", auth, deleteResource);
router.post("/:id/download", auth, downloadResource);

module.exports = router;