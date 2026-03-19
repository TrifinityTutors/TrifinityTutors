const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  subject: String,
  locality: String,
  experience: Number,
  phone: String,
  status: {
    type: String,
    default: "pending", // pending | approved | rejected
  }
});

module.exports = mongoose.model("Tutor", tutorSchema);