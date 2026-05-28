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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.log(err));

// Socket.IO — each user joins a room with their own userId
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });
});

// Inject socket into booking routes
bookingRoutes.setIO(io);

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/bookings", bookingRoutes);

// Switch from app.listen to httpServer.listen
httpServer.listen(5000, () => {
  console.log("Server running on port 5000");
});