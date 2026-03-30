const mongoose = require("mongoose");

const tutorUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  googleId: String,
  photo: String,
  role: {
    type: String,
    default: "tutor"
  }
}, { timestamps: true });

module.exports = mongoose.model("Tutoruser", tutorUserSchema);