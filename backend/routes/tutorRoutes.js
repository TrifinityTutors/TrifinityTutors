const express = require("express");
const router = express.Router();
const Tutor = require("../models/Tutor");
const auth = require("../middleware/auth");
const protectTutor = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Tutoruser = require("../models/Tutoruser");



// GET all tutors
router.get("/", auth, async (req, res) => {
  try {
    const data = await Tutor.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET total tutors count
router.get("/count", auth, async (req, res) => {
  const count = await Tutor.countDocuments();
  res.json({ count });
});


// 🔐 Google Login Route
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture, sub } = payload;
    let user = await Tutoruser.findOne({ email });

    if (!user) {
      user = await Tutoruser.create({
        name,
        email,
        googleId: sub,
        photo: picture,
        role: "tutor"
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: jwtToken,
      user
      
    });

  } catch (err) {
    console.log(err);
    res.status(401).json({
      success: false,
      message: "Google login failed"
    });
  }
});



router.post("/complete-profile", protectTutor, async (req, res) => {
  try {
    const user = await Tutoruser.findById(req.user.id);

    const existing = await Tutor.findOne({ email: user.email });
    if (existing) {
      return res.json({ message: "Profile already exists" });
    }

    const tutor = await Tutor.create({
      name: user.name,
      email: user.email,

      subject: req.body.subject,
      locality: req.body.locality,
      experience: req.body.experience,
      phone: req.body.phone,

      status: "pending"
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

module.exports = router;