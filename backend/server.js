require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");

const studentRoutes = require("./routes/studentRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// MUST be before express.json() — preserves raw body for Razorpay signature check
app.use("/api/bookings/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

// Serve uploads folder as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.warn("⚠️ Warning: MONGO_URI is not set in environment variables!");
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));
}

// Socket.IO — each user joins a room with their own userId
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });
});

// Inject socket into booking routes
bookingRoutes.setIO(io);

// Health check routes (for Render service monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

// Optional: Serve frontend static build if present (enables single-service deployment)
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const fs = require("fs");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Trifinity Tutors Backend API is running.");
  });
}

const PORT = process.env.PORT || 5001;

// Switch from app.listen to httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});