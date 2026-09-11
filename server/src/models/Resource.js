const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  type: { type: String, enum: ["Notes", "PYQ", "Assignment", "Question Bank", "Other"], required: true },
  subject: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1, max: 20 },
  branch: { type: String, trim: true, default: "" },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  downloads: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

resourceSchema.index({ title: "text", description: "text", subject: "text" });
module.exports = mongoose.model("Resource", resourceSchema);