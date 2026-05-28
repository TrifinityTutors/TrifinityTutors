const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tutorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tutoruser', required: true },
  date:       { type: String, required: true },
  timeSlot:   { type: String, required: true },
  mode:       { type: String, enum: ['online', 'offline'], required: true },
  durationMins: { type: Number, default: 60 },
  hourlyRate:   { type: Number, required: true },
  totalAmount:  { type: Number, required: true },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  paymentSignature:  { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);