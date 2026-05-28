const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tutorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tutorName:    { type: String, required: true },
  tutorImage:   { type: String, default: '' },
  studentName:  { type: String, default: '' },
  studentImage: { type: String, default: '' },
  subject:      { type: String, default: '' },
  date:         { type: String, required: true },
  time:         { type: String, required: true },
  mode:         { type: String, enum: ['online', 'home'], required: true },
  durationHours:{ type: Number, default: 1 },
  durationMins: { type: Number, default: 60 },
  hourlyRate:   { type: Number, required: true },
  totalAmount:  { type: Number, required: true },
  paymentStatus:{ type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  bookingStatus:{ type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  meetingLink:  { type: String, default: '' },
  location:     { type: String, default: '' },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  paymentSignature:  { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);