const mongoose = require("mongoose")

const StudentRequestSchema = new mongoose.Schema({
  name: String,
  class: String,
  subject: String,
  locality: String,
  board: String, // CBSE, ICSE, State Board, Other
  phoneNumber: String,
  exactAddress: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("StudentRequest", StudentRequestSchema)