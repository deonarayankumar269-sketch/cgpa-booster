require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const User = require("./models/User");
const Resource = require("./models/Resource");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 5000;
const origins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(x => x.trim()) : ["http://localhost:5173"];

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use("/api/auth", authRoutes);

const auth = (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });
    req.user = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: "Invalid or expired session" }); }
};

app.get("/api/health", (_, res) => res.json({ status: "ok", service: "academic-hub-server" }));

app.get("/api/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

app.get("/api/resources", auth, async (req, res) => {
  try {
    const { search = "", type, subject, semester, page = 1, limit = 12 } = req.query;
    const q = {};
    if (search.trim()) q.$text = { $search: search.trim() };
    if (type) q.type = type;
    if (subject) q.subject = new RegExp(`^${subject.trim()}$`, "i");
    if (semester) q.semester = Number(semester);
    const p = Math.max(Number(page), 1), l = Math.min(Math.max(Number(limit), 1), 50);
    const [resources, total] = await Promise.all([
      Resource.find(q).populate("uploadedBy", "name email").sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      Resource.countDocuments(q)
    ]);
    res.json({ resources, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
  } catch { res.status(500).json({ message: "Unable to load resources" }); }
});

app.post("/api/resources", auth, async (req, res) => {
  try {
    const { title, description, type, subject, semester, branch, fileUrl } = req.body;
    if (!title || !type || !subject || !semester || !fileUrl)
      return res.status(400).json({ message: "Required resource fields are missing" });
    const resource = await Resource.create({
      title: title.trim(), description: description?.trim() || "", type,
      subject: subject.trim(), semester: Number(semester), branch: branch?.trim() || "",
      fileUrl: fileUrl.trim(), uploadedBy: req.user.userId
    });
    res.status(201).json({ resource: await Resource.findById(resource._id).populate("uploadedBy", "name email") });
  } catch { res.status(500).json({ message: "Unable to create resource" }); }
});

app.post("/api/resources/:id/download", auth, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
  if (!resource) return res.status(404).json({ message: "Resource not found" });
  res.json({ fileUrl: resource.fileUrl, downloads: resource.downloads });
});

app.post("/api/academic/sgpa", auth, (req, res) => {
  const { subjects } = req.body;
  if (!Array.isArray(subjects) || !subjects.length) return res.status(400).json({ message: "Subjects are required" });
  let credits = 0, points = 0;
  for (const s of subjects) {
    const c = Number(s.credits), g = Number(s.gradePoint);
    if (!Number.isFinite(c) || !Number.isFinite(g) || c <= 0 || g < 0) return res.status(400).json({ message: "Invalid subject data" });
    credits += c; points += c * g;
  }
  res.json({ sgpa: Number((points / credits).toFixed(2)), totalCredits: credits });
});

app.post("/api/academic/cgpa", auth, (req, res) => {
  const { semesters } = req.body;
  if (!Array.isArray(semesters) || !semesters.length) return res.status(400).json({ message: "Semester data is required" });
  let credits = 0, points = 0;
  for (const s of semesters) {
    const g = Number(s.sgpa), c = Number(s.credits);
    if (!Number.isFinite(g) || !Number.isFinite(c) || g < 0 || c <= 0) return res.status(400).json({ message: "Invalid semester data" });
    credits += c; points += g * c;
  }
  res.json({ cgpa: Number((points / credits).toFixed(2)), totalCredits: credits });
});

const io = new Server(server, { cors: { origin: origins, methods: ["GET", "POST"] } });
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { next(new Error("Invalid session")); }
});
io.on("connection", socket => {
  socket.on("join-room", ({ roomId }) => {
    if (!roomId?.trim()) return;
    const room = roomId.trim();
    socket.join(room);
    socket.emit("room-joined", { roomId: room });
    socket.to(room).emit("member-joined", { userId: socket.user.userId });
  });
  socket.on("leave-room", ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    socket.to(roomId).emit("member-left", { userId: socket.user.userId });
  });
  socket.on("room-message", ({ roomId, message }) => {
    if (!roomId || typeof message !== "string" || !message.trim()) return;
    io.to(roomId).emit("room-message", {
      id: `${socket.id}-${Date.now()}`, userId: socket.user.userId,
      message: message.trim(), createdAt: new Date().toISOString()
    });
  });
});

app.use((_, res) => res.status(404).json({ message: "Endpoint not found" }));
app.use((err, _, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Internal server error" });
});

connectDB().then(() => server.listen(PORT, () => console.log(`CGPA Booster server on ${PORT}`)))
  .catch(e => { console.error(e); process.exit(1); });