const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor"
  },

  studentRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentRequest"
  },

  status: {
    type: String,
    default: "pending"
  }
});

module.exports = mongoose.model("Application", ApplicationSchema);