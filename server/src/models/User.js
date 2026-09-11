const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  university: { type: String, trim: true, default: "" },
  course: { type: String, trim: true, default: "" },
  branch: { type: String, trim: true, default: "" },
  semester: { type: Number, min: 1, max: 20, default: 1 },
  avatar: { type: String, default: "" }
}, { timestamps: true });

userSchema.set("toJSON", {
  transform: (_, obj) => {
    delete obj.password;
    delete obj.__v;
    return obj;
  }
});

module.exports = mongoose.model("User", userSchema);