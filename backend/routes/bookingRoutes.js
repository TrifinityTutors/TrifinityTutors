const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const auth = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Socket.IO injection
let io;


// 1. Student calls this to start a booking
router.post('/create-order', auth, async (req, res) => {
  try {
    const { tutorId, date, timeSlot, mode, durationMins = 60 } = req.body;
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

    const totalAmount = Math.round((tutor.hourlyRate / 60) * durationMins * 100);

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: { tutorId, studentId: req.user.id, date, timeSlot, mode, durationMins },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      tutorName: tutor.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Razorpay webhook — verify signature, save booking, notify both parties
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const body = req.body.toString();

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (sig !== expectedSig) return res.status(400).json({ error: 'Invalid signature' });

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const notes = payment.notes;

    const booking = await Booking.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      {
        razorpayPaymentId: payment.id,
        paymentSignature: sig,
        status: 'confirmed',
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        setOnInsert: {
          tutorId: notes.tutorId,
          studentId: notes.studentId,
          date: notes.date,
          timeSlot: notes.timeSlot,
          mode: notes.mode,
          durationMins: notes.durationMins,
          hourlyRate: payment.amount / (notes.durationMins / 60) / 100,
          totalAmount: payment.amount / 100,
          razorpayOrderId: payment.order_id,
        },
      }
    ).populate('tutorId', 'name').populate('studentId', 'name');

    // Notify student and tutor via socket
    if (io) {
      io.to(notes.studentId).emit('booking_confirmed', {
        bookingId: booking._id,
        tutorName: booking.tutorId?.name,
        date: notes.date,
        timeSlot: notes.timeSlot,
      });

      io.to(notes.tutorId).emit('new_booking', {
        bookingId: booking._id,
        studentName: booking.studentId?.name,
        date: notes.date,
        timeSlot: notes.timeSlot,
      });
    }
  }

  // Handle refund confirmed
  if (event.event === 'refund.processed') {
    const refund = event.payload.refund.entity;
    await Booking.findOneAndUpdate(
      { refundId: refund.id },
      { status: 'refunded' }
    );
  }

  res.json({ received: true });
});

// 3. Get bookings for the logged-in student
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate('tutorId', 'name photo subject hourlyRate')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get bookings for the logged-in tutor
router.get('/tutor', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ tutorId: req.user.id, status: 'confirmed' })
      .populate('studentId', 'name email photo')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Student requests a refund
router.post('/:bookingId/refund', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.studentId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your booking' });
    if (booking.status !== 'confirmed')
      return res.status(400).json({ error: 'Booking is not eligible for refund' });

    const sessionDateTime = new Date(`${booking.date} ${booking.timeSlot}`);
    const hoursUntilSession = (sessionDateTime - Date.now()) / (1000 * 60 * 60);
    const refundAmount = hoursUntilSession >= 24
      ? booking.totalAmount
      : booking.totalAmount * 0.5;

    const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      notes: { bookingId: booking._id.toString(), reason: req.body.reason || 'Student cancellation' },
    });

    booking.status = 'refund_requested';
    booking.refundId = refund.id;
    booking.refundAmount = refundAmount;
    booking.refundReason = req.body.reason;
    booking.refundRequestedAt = new Date();
    await booking.save();

    res.json({ message: 'Refund initiated', refundId: refund.id, refundAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.setIO = (socketIO) => { io = socketIO; };
module.exports = router;