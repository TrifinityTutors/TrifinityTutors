const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, required: true },
  photo: { type: String, default: "" },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  preferredSubjects: { type: [String], default: [] },
  location: { type: String, default: "" },
  bookedSessions: [{ type: mongoose.Schema.Types.Mixed }],
  savedTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tutor" }],
  role: { type: String, default: "student" },
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
