const mongoose = require("mongoose")

const TutorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  subject: String,
  locality: String,
  experience: Number,
  phone: String
})

module.exports = mongoose.model("Tutor", TutorSchema)