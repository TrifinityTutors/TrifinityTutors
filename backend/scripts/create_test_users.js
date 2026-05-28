const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/trifinity');
  await Tutor.deleteMany({ email: /test-tutor/ });
  await Student.deleteMany({ email: /test-student/ });

  const tutor = await Tutor.create({
    name: 'Test Tutor',
    email: 'test-tutor@example.com',
    subject: 'Math',
    hourlyRate: 500,
    profileComplete: true,
    status: 'approved',
  });

  const student = await Student.create({
    name: 'Test Student',
    email: 'test-student@example.com',
    googleId: 'student-google-id',
    photo: '',
    role: 'student',
  });

  const tutorToken = jwt.sign({ id: tutor._id.toString(), role: 'tutor' }, 'devsecret', { expiresIn: '7d' });
  const studentToken = jwt.sign({ id: student._id.toString(), role: 'student' }, 'devsecret', { expiresIn: '7d' });

  console.log('TUTOR_ID', tutor._id.toString());
  console.log('STUDENT_ID', student._id.toString());
  console.log('TUTOR_TOKEN', tutorToken);
  console.log('STUDENT_TOKEN', studentToken);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
