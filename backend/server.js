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

// MongoDB Connection & Health Management
const FALLBACK_MONGO_URI = "mongodb+srv://priyanshumahobia54_db_user:Myredmi6@cluster0.zbwqw5b.mongodb.net/test?appName=Cluster0";

function sanitizeMongoUri(raw) {
  if (!raw || typeof raw !== "string") return "";
  let uri = raw.trim();
  // Strip BOM and non-printable zero-width characters
  uri = uri.replace(/^[\uFEFF\xA0\s]+|[\uFEFF\xA0\s]+$/g, "");
  // Strip surrounding quotes
  uri = uri.replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, "");
  // If user pasted "MONGO_URI=" or "MONGO_URL=" or "URI=" or "export MONGO_URI=" at the front
  uri = uri.replace(/^(?:export\s+)?(?:MONGO_URI|MONGO_URL|DATABASE_URL|URI)\s*=\s*/i, "");
  // Strip again if it had quotes after the =
  uri = uri.replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, "");
  uri = uri.trim();
  
  const match = uri.match(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/i);
  if (match) {
    uri = match[0].trim();
  }
  return uri;
}

function resolveMongoUri() {
  const sanitizedEnv = sanitizeMongoUri(process.env.MONGO_URI);
  if (sanitizedEnv && (sanitizedEnv.startsWith("mongodb://") || sanitizedEnv.startsWith("mongodb+srv://"))) {
    return { uri: sanitizedEnv, source: "env" };
  }
  return { uri: FALLBACK_MONGO_URI, source: "fallback" };
}

let { uri: currentMongoUri, source: currentMongoUriSource } = resolveMongoUri();

function maskMongoUri(uri) {
  if (!uri) return "not-configured";
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
  } catch {
    return "configured (masked)";
  }
}

let lastMongoError = null;
let isConnecting = false;

function connectToDatabase() {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;
  console.log(`Connecting to MongoDB Atlas (source: ${currentMongoUriSource})...`);
  mongoose.connect(currentMongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      isConnecting = false;
      lastMongoError = null;
      console.log(`MongoDB Atlas Connected successfully to db "${mongoose.connection.name}"`);
    })
    .catch((err) => {
      isConnecting = false;
      lastMongoError = err.message || String(err);
      console.error("MongoDB Connection Error:", lastMongoError);

      // If env URI failed, automatically fall back to the known working Atlas cluster!
      if (currentMongoUriSource === "env" && currentMongoUri !== FALLBACK_MONGO_URI) {
        console.warn("⚠️ Switching from failed env MONGO_URI to verified FALLBACK_MONGO_URI...");
        currentMongoUri = FALLBACK_MONGO_URI;
        currentMongoUriSource = "fallback_after_env_failure";
      }

      setTimeout(connectToDatabase, 5000);
    });
}

mongoose.connection.on("connected", () => {
  lastMongoError = null;
  console.log("MongoDB connection event: connected");
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection event: disconnected. Retrying in 5 seconds...");
  setTimeout(connectToDatabase, 5000);
});

mongoose.connection.on("error", (err) => {
  lastMongoError = err.message || String(err);
  console.error("MongoDB connection event error:", lastMongoError);
});

connectToDatabase();

// Socket.IO — each user joins a room with their own userId
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });
});

// Inject socket into booking routes
bookingRoutes.setIO(io);

// Health check routes (for Render service monitoring and diagnostics)
app.get("/health", (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    status: "ok",
    dbStatus: states[readyState] || "unknown",
    dbReadyState: readyState,
    dbName: mongoose.connection.name || null,
    mongoConfigured: Boolean(process.env.MONGO_URI),
    mongoUriSource: currentMongoUriSource,
    mongoUriMasked: maskMongoUri(currentMongoUri),
    lastMongoError,
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