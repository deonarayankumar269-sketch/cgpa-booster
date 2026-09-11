const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const tokenFor = (id) => jwt.sign(
  { userId: id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

const clean = (u) => ({
  id: u._id, name: u.name, email: u.email,
  university: u.university, course: u.course,
  branch: u.branch, semester: u.semester,
  avatar: u.avatar, createdAt: u.createdAt
});

const register = async (req, res) => {
  try {
    const { name, email, password, university, course, branch, semester } = req.body;
    if (!name || !email || typeof password !== "string")
      return res.status(400).json({ message: "Name, email and password are required" });

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail }))
      return res.status(409).json({ message: "An account with this email already exists" });

    const user = await User.create({
      name: name.trim(), email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      university: university?.trim() || "",
      course: course?.trim() || "",
      branch: branch?.trim() || "",
      semester: Number(semester) || 1
    });

    res.status(201).json({
      message: "Account created successfully",
      token: tokenFor(user._id), user: clean(user)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to create account" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || typeof password !== "string")
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful",
      token: tokenFor(user._id), user: clean(user)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to log in" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: clean(user) });
  } catch {
    res.status(500).json({ message: "Unable to load profile" });
  }
};

module.exports = { register, login, getMe };