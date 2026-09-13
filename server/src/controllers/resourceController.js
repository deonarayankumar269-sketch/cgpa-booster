const Resource = require("../models/Resource");

const listResources = async (req, res) => {
  try {
    const { search = "", type, subject, semester, page = 1, limit = 12 } = req.query;
    const q = {};
    if (search.trim()) q.$text = { $search: search.trim() };
    if (type) q.type = type;
    if (subject) q.subject = new RegExp(`^${subject.trim()}$`, "i");
    if (semester) q.semester = Number(semester);

    const p = Math.max(Number(page), 1);
    const l = Math.min(Math.max(Number(limit), 1), 50);

    const [resources, total] = await Promise.all([
      Resource.find(q)
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      Resource.countDocuments(q)
    ]);

    res.json({ resources, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to load resources" });
  }
};

const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate("uploadedBy", "name email");
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ resource });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to load resource" });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, description, type, subject, semester, branch, fileUrl } = req.body;
    if (!title || !type || !subject || !semester || !fileUrl) {
      return res.status(400).json({ message: "Required resource fields are missing" });
    }
    const resource = await Resource.create({
      title: title.trim(),
      description: description?.trim() || "",
      type,
      subject: subject.trim(),
      semester: Number(semester),
      branch: branch?.trim() || "",
      fileUrl: fileUrl.trim(),
      uploadedBy: req.user.userId
    });
    res.status(201).json({
      resource: await Resource.findById(resource._id).populate("uploadedBy", "name email")
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to create resource" });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only edit your own resources" });
    }

    const { title, description, type, subject, semester, branch, fileUrl } = req.body;
    if (title !== undefined) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (type !== undefined) resource.type = type;
    if (subject !== undefined) resource.subject = subject.trim();
    if (semester !== undefined) resource.semester = Number(semester);
    if (branch !== undefined) resource.branch = branch.trim();
    if (fileUrl !== undefined) resource.fileUrl = fileUrl.trim();

    await resource.save();
    res.json({ resource: await resource.populate("uploadedBy", "name email") });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to update resource" });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete your own resources" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to delete resource" });
  }
};

const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ fileUrl: resource.fileUrl, downloads: resource.downloads });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to process download" });
  }
};

module.exports = {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
};