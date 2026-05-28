const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const Tutoruser = require('../models/Tutoruser');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Socket.IO injection
let io;

async function resolveTutorProfileId(req) {
  if (!req.user) return null;
  if (req.user.role !== 'tutor') return req.user.id;
  if (req.user.profileId) return req.user.profileId.toString();

  if (req.user.email) {
    const tutorProfile = await Tutor.findOne({ email: req.user.email }).select('_id');
    if (tutorProfile) return tutorProfile._id.toString();
  }

  const tutorUser = await Tutoruser.findById(req.user.id);
  if (!tutorUser) return req.user.id;

  const tutorProfile = await Tutor.findOne({ email: tutorUser.email }).select('_id');
  return tutorProfile ? tutorProfile._id.toString() : req.user.id;
}

async function getTutorSocketRoomIdsByProfileId(tutorId) {
  const rooms = [];
  if (tutorId) rooms.push(tutorId.toString());

  const tutorProfile = await Tutor.findById(tutorId).select('email');
  if (!tutorProfile?.email) return rooms;

  const tutorUser = await Tutoruser.findOne({ email: tutorProfile.email }).select('_id');
  if (tutorUser) rooms.push(tutorUser._id.toString());

  return [...new Set(rooms)];
}


// 1. Student calls this to start a booking
router.post('/create-order', auth, async (req, res) => {
  try {
    // Expect booking details from frontend: tutorId, date, timeSlot, mode, duration (hours), subtotal, platformFee, total
    const { tutorId, date, timeSlot, mode, duration, subtotal, platformFee, total } = req.body;
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

    // Normalize duration (hours) and compute minutes
    const durationHours = Number(duration) || 0;
    const durationMins = Math.round(durationHours * 60);

    // Server-side compute expected subtotal and total to avoid tampering
    const expectedSubtotal = Number((tutor.hourlyRate || 0) * durationHours);
    const expectedPlatformFee = Number(platformFee || 0);
    const expectedTotal = Number((expectedSubtotal || 0) + expectedPlatformFee);

    // Use frontend total if it matches expectedTotal within small tolerance, otherwise prefer server expectedTotal
    const sentTotal = Number(total || 0);
    const finalTotal = Math.abs(sentTotal - expectedTotal) < 0.01 ? sentTotal : expectedTotal;

    // Convert to paise
    const amountInPaise = Math.round(finalTotal * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        tutorId,
        tutorName: tutor.name || '',
        studentId: req.user.id,
        studentName: req.user.name || '',
        date,
        timeSlot,
        mode,
        durationHours,
        durationMins,
        subtotal: expectedSubtotal,
        platformFee: expectedPlatformFee,
        total: finalTotal,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      tutorName: tutor.name,
      keyId: process.env.RAZORPAY_KEY_ID,
      total: finalTotal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Student confirms payment in the frontend and creates the booking record immediately
router.post('/create', auth, async (req, res) => {
  try {
    const {
      tutorId,
      tutorName,
      tutorImage,
      subject,
      date,
      time,
      mode,
      duration,
      subtotal,
      platformFee,
      total,
      orderId,
      paymentId,
      paymentSignature,
      location,
      meetingLink,
    } = req.body;

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

    const durationHours = Number(duration) || 0;
    const durationMins = Math.round(durationHours * 60);
    const finalTotal = Number(total || 0);
    const expectedTotal = Number((tutor.hourlyRate || 0) * durationHours + Number(platformFee || 0));
    const totalAmount = Math.abs(finalTotal - expectedTotal) < 0.1 ? finalTotal : expectedTotal;

    const bookingData = {
      tutorId,
      studentId: req.user.id,
      studentName: student.name || '',
      studentImage: student.photo || student.profilePhoto || '',
      tutorName: tutorName || tutor.name,
      tutorImage: tutorImage || tutor.profilePhoto || tutor.photo || '',
      subject: subject || tutor.subject || tutor.subjects?.[0] || 'Tutoring',
      date,
      time,
      mode: mode === 'home' ? 'home' : 'online',
      durationHours,
      durationMins,
      hourlyRate: Number(tutor.hourlyRate || 0),
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'upcoming',
      meetingLink: meetingLink || (mode === 'online' ? `https://meet.trifinity.io/${Date.now().toString(36)}` : ''),
      location: location || '',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      paymentSignature,
      status: 'confirmed',
    };

    let booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (booking) {
      booking = await Booking.findByIdAndUpdate(booking._id, bookingData, { new: true });
    } else {
      booking = await Booking.create(bookingData);
    }

    student.bookedSessions = student.bookedSessions || [];
    student.bookedSessions.push({
      bookingId: booking._id,
      tutorName: booking.tutorName,
      subject: booking.subject,
      date: booking.date,
      time: booking.time,
      mode: booking.mode,
      bookingStatus: booking.bookingStatus,
      totalAmount: booking.totalAmount,
    });
    await student.save();

    await Notification.create({
      userId: req.user.id,
      title: 'Booking confirmed',
      message: `Your session with ${booking.tutorName} is confirmed for ${booking.date} ${booking.time}`,
      type: 'booking',
      meta: {
        bookingId: booking._id,
        tutorName: booking.tutorName,
        date: booking.date,
        time: booking.time,
        mode: booking.mode,
      },
    });

    await Notification.create({
      userId: tutorId,
      title: 'New session booked',
      message: `New booking from ${student.name || 'a student'} for ${booking.subject} on ${booking.date} ${booking.time}`,
      type: 'booking',
      meta: {
        bookingId: booking._id,
        studentName: student.name,
        subject: booking.subject,
        date: booking.date,
        time: booking.time,
        mode: booking.mode,
      },
    });

    if (io) {
      const roomIds = await getTutorSocketRoomIdsByProfileId(tutorId);
      for (const room of roomIds) {
        io.to(room).emit('new_booking', {
          bookingId: booking._id,
          studentName: student.name,
          subject: booking.subject,
          date: booking.date,
          time: booking.time,
          mode: booking.mode,
          bookingStatus: booking.bookingStatus,
        });
        io.to(room).emit('notification');
      }
      io.to(req.user.id.toString()).emit('new_booking', {
        bookingId: booking._id,
        tutorName: booking.tutorName,
        subject: booking.subject,
        date: booking.date,
        time: booking.time,
        mode: booking.mode,
        bookingStatus: booking.bookingStatus,
      });
      io.to(req.user.id.toString()).emit('notification');
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Razorpay webhook — verify signature, save booking, notify both parties
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

    let booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.bookingStatus = booking.bookingStatus === 'cancelled' ? 'cancelled' : 'upcoming';
      booking.razorpayPaymentId = payment.id;
      booking.paymentSignature = sig;
      await booking.save();
    } else {
      booking = await Booking.create({
        tutorId: notes.tutorId,
        studentId: notes.studentId,
        tutorName: notes.tutorName || '',
        tutorImage: notes.tutorImage || '',
        subject: notes.subject || 'Tutoring',
        date: notes.date,
        time: notes.time || notes.timeSlot || '',
        mode: notes.mode === 'home' ? 'home' : 'online',
        durationHours: notes.durationHours,
        durationMins: notes.durationMins,
        hourlyRate: notes.durationHours && notes.durationHours > 0 ? Number(notes.subtotal) / Number(notes.durationHours) : 0,
        totalAmount: payment.amount / 100,
        paymentStatus: 'paid',
        bookingStatus: 'upcoming',
        meetingLink: notes.meetingLink || '',
        location: notes.location || '',
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        paymentSignature: sig,
        status: 'confirmed',
      });
    }

    const tutorRoom = notes.tutorId?.toString();
    const studentRoom = notes.studentId?.toString();

    const existingTutorNotification = await Notification.findOne({
      userId: notes.tutorId,
      'meta.bookingId': booking._id,
      title: /New session booked|New booking from/i,
    });

    if (!existingTutorNotification) {
      await Notification.create({
        userId: notes.tutorId,
        title: 'New session booked',
        message: `New booking from ${notes.studentName || 'a student'} for ${booking.subject} on ${booking.date} ${booking.time}`,
        type: 'booking',
        meta: {
          bookingId: booking._id,
          studentName: notes.studentName || '',
          subject: booking.subject,
          date: booking.date,
          time: booking.time,
          mode: booking.mode,
        },
      });
    }

    if (io) {
      if (studentRoom) {
        io.to(studentRoom).emit('booking_confirmed', {
          bookingId: booking._id,
          tutorName: booking.tutorName,
          date: booking.date,
          time: booking.time || notes.timeSlot,
        });
        io.to(studentRoom).emit('notification');
      }
      if (tutorRoom) {
        const tutorRoomIds = await getTutorSocketRoomIdsByProfileId(tutorRoom);
        for (const room of tutorRoomIds) {
          io.to(room).emit('new_booking', {
            bookingId: booking._id,
            studentName: notes.studentName || '',
            subject: booking.subject,
            date: booking.date,
            time: booking.time || notes.timeSlot,
            mode: booking.mode === 'home' ? 'home' : 'online',
            bookingStatus: booking.bookingStatus,
          });
          io.to(room).emit('notification');
        }
      }
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
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/student', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:bookingId/cancel', auth, async (req, res) => {
  try {
    const tutorProfileId = await resolveTutorProfileId(req);
    const booking = await Booking.findById(req.params.bookingId).populate('studentId', 'name email photo');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const isOwner = booking.studentId && booking.studentId._id.toString() === req.user.id;
    const isTutor = booking.tutorId.toString() === tutorProfileId;
    if (!isOwner && !isTutor) return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    if (booking.bookingStatus === 'cancelled') return res.status(400).json({ error: 'Booking already cancelled' });

    booking.status = 'cancelled';
    booking.bookingStatus = 'cancelled';
    await booking.save();

    const ownerId = isOwner ? booking.studentId._id : booking.studentId?._id;
    const otherUserId = isOwner ? booking.tutorId : booking.studentId?._id;

    await Notification.create({
      userId: req.user.id,
      title: 'Booking cancelled',
      message: `Your session with ${booking.tutorName} on ${booking.date} ${booking.time} has been cancelled.`,
      type: 'booking',
      meta: { bookingId: booking._id },
    });

    if (otherUserId) {
      await Notification.create({
        userId: otherUserId,
        title: 'Session cancelled',
        message: `${isTutor ? 'Tutor' : booking.studentId?.name || 'Student'} cancelled the session for ${booking.subject} on ${booking.date} ${booking.time}.`,
        type: 'booking',
        meta: { bookingId: booking._id },
      });
    }

    if (io) {
      if (otherUserId) io.to(otherUserId.toString()).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'cancelled',
      });
      io.to(req.user.id).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'cancelled',
      });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:bookingId/accept', auth, async (req, res) => {
  try {
    const tutorProfileId = await resolveTutorProfileId(req);
    const booking = await Booking.findById(req.params.bookingId).populate('studentId', 'name email photo');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.tutorId.toString() !== tutorProfileId) return res.status(403).json({ error: 'Not your booking' });

    booking.status = 'confirmed';
    booking.bookingStatus = 'upcoming';
    await booking.save();

    await Notification.create({
      userId: booking.studentId._id,
      title: 'Session accepted',
      message: `${booking.tutorName} accepted your ${booking.subject} session on ${booking.date} ${booking.time}.`,
      type: 'booking',
      meta: { bookingId: booking._id, bookingStatus: booking.bookingStatus },
    });

    if (io) {
      io.to(booking.studentId._id.toString()).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'accepted',
      });
      io.to(req.user.id).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'accepted',
      });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:bookingId/reject', auth, async (req, res) => {
  try {
    const tutorProfileId = await resolveTutorProfileId(req);
    const booking = await Booking.findById(req.params.bookingId).populate('studentId', 'name email photo');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.tutorId.toString() !== tutorProfileId) return res.status(403).json({ error: 'Not your booking' });
    if (booking.bookingStatus === 'cancelled') return res.status(400).json({ error: 'Booking already cancelled' });

    booking.status = 'cancelled';
    booking.bookingStatus = 'cancelled';
    await booking.save();

    await Notification.create({
      userId: booking.studentId._id,
      title: 'Session rejected',
      message: `${booking.tutorName} rejected your ${booking.subject} session on ${booking.date} ${booking.time}.`,
      type: 'booking',
      meta: { bookingId: booking._id, bookingStatus: booking.bookingStatus },
    });

    if (io) {
      io.to(booking.studentId._id.toString()).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'rejected',
      });
      io.to(req.user.id).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'rejected',
      });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:bookingId/reschedule', auth, async (req, res) => {
  try {
    const tutorProfileId = await resolveTutorProfileId(req);
    const { date, time, mode, location } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('studentId', 'name email photo');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.tutorId.toString() !== tutorProfileId) return res.status(403).json({ error: 'Not your booking' });
    if (booking.bookingStatus === 'cancelled') return res.status(400).json({ error: 'Cannot reschedule a cancelled booking' });

    if (date) booking.date = date;
    if (time) booking.time = time;
    if (mode) booking.mode = mode === 'home' ? 'home' : 'online';
    if (location !== undefined) booking.location = location;
    booking.bookingStatus = 'upcoming';
    await booking.save();

    await Notification.create({
      userId: booking.studentId._id,
      title: 'Session rescheduled',
      message: `${booking.tutorName} rescheduled your ${booking.subject} session to ${booking.date} ${booking.time}.`,
      type: 'booking',
      meta: { bookingId: booking._id, bookingStatus: booking.bookingStatus },
    });

    if (io) {
      io.to(booking.studentId._id.toString()).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'rescheduled',
        date: booking.date,
        time: booking.time,
      });
      io.to(req.user.id).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'rescheduled',
        date: booking.date,
        time: booking.time,
      });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:bookingId/complete', auth, async (req, res) => {
  try {
    const tutorProfileId = await resolveTutorProfileId(req);
    const booking = await Booking.findById(req.params.bookingId).populate('studentId', 'name email photo');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.tutorId.toString() !== tutorProfileId) return res.status(403).json({ error: 'Not your booking' });
    if (booking.bookingStatus === 'completed') return res.status(400).json({ error: 'Booking already completed' });

    booking.bookingStatus = 'completed';
    booking.status = 'confirmed';
    await booking.save();

    await Notification.create({
      userId: booking.studentId._id,
      title: 'Session completed',
      message: `Your ${booking.subject} session with ${booking.tutorName} on ${booking.date} ${booking.time} was marked completed.`,
      type: 'booking',
      meta: { bookingId: booking._id, bookingStatus: booking.bookingStatus },
    });

    if (io) {
      io.to(booking.studentId._id.toString()).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'completed',
      });
      io.to(req.user.id).emit('booking_updated', {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        action: 'completed',
      });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get bookings for the logged-in tutor
router.get('/tutor', auth, async (req, res) => {
  try {
    const tutorProfileId = await resolveTutorProfileId(req);
    const bookings = await Booking.find({ tutorId: tutorProfileId })
      .populate('studentId', 'name email photo')
      .sort({ createdAt: -1, date: -1, time: -1 });
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