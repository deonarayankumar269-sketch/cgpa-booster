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
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 5000;
const origins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(x => x.trim()) : ["http://localhost:5173"];

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 });
app.use("/api", generalLimiter);
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
const passport = require("./config/passport");
app.use(passport.initialize());
app.use("/api/auth", authRoutes);

const auth = require("./middleware/authMiddleware");

app.get("/api/health", (_, res) => res.json({ status: "ok", service: "academic-hub-server" }));

app.get("/api/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
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

app.use("/api/resources", resourceRoutes);

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
  console.log("🟢 Socket connected:", socket.id, "user:", socket.user?.userId);

  const broadcastCount = (roomId) => {
    const size = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit("room-count", { count: size });
  };

  socket.on("join-room", ({ roomId }) => {
    if (!roomId?.trim()) return;
    const room = roomId.trim();
    console.log("👥 Join room:", room, "by user:", socket.user?.userId);
    socket.join(room);
    socket.emit("room-joined", { roomId: room });
    broadcastCount(room);
  });

  socket.on("leave-room", ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    broadcastCount(roomId);
  });

  socket.on("room-message", ({ roomId, message }) => {
    console.log("💬 Message received:", { roomId, message, from: socket.user?.userId, socketRooms: [...socket.rooms] });
    if (!roomId || typeof message !== "string" || !message.trim()) return;
    io.to(roomId).emit("room-message", {
      id: `${socket.id}-${Date.now()}`, userId: socket.user.userId,
      message: message.trim(), createdAt: new Date().toISOString()
    });
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
        broadcastCount(room);
      }
    }
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