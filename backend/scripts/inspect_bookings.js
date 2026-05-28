const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/trifinity');
  const booking = await Booking.findOne({ razorpayOrderId: 'order_test_123' }).lean();
  console.log('booking', booking ? JSON.stringify(booking, null, 2) : 'not found');
  const tutorNotifications = await Notification.find({ userId: '6a18197e172d8a07fa033d3d' }).lean();
  console.log('tutorNotifications', tutorNotifications.length);
  console.log(JSON.stringify(tutorNotifications, null, 2));
  const studentNotifications = await Notification.find({ userId: '6a18197e172d8a07fa033d3f' }).lean();
  console.log('studentNotifications', studentNotifications.length);
  console.log(JSON.stringify(studentNotifications, null, 2));
  const bookingsForTutor = await Booking.find({ tutorId: '6a18197e172d8a07fa033d3d' }).lean();
  console.log('bookingsForTutor', bookingsForTutor.length);
  await mongoose.disconnect();
})();
