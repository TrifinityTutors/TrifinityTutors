const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true }, // 🔥 make unique
  password: String,

  subject: String,
  locality: String,
  experience: Number,
  phone: String,

  status: {
    type: String,
    default: "pending", // pending | approved | rejected
  },

  // 🔥 ADD THESE (for Google + flow)
  googleId: String,
  photo: String,
  profileComplete: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

module.exports = mongoose.model("Tutor", tutorSchema);