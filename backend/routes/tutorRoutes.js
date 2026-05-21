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
    
    console.log("🔐 Google OAuth - Processing login for:", email);
    
    let user = await Tutoruser.findOne({ email });

    if (!user) {
      console.log("Creating new Tutoruser for:", email);
      user = await Tutoruser.create({
        name,
        email,
        googleId: sub,
        photo: picture,
        role: "tutor"
      });
      console.log("✅ New Tutoruser created:", { id: user._id, email: user.email });
    } else {
      console.log("Existing Tutoruser found:", { id: user._id, email: user.email });
    }

    // Check if user has completed profile by looking for Tutor document with same email
    const tutorProfile = await Tutor.findOne({ email });
    const isProfileComplete = !!tutorProfile;

    console.log("Profile check for", email, ":", {
      isProfileComplete,
      tutorProfileId: tutorProfile?._id,
      tutorStatus: tutorProfile?.status
    });

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: jwtToken,
      user,  // This is Tutoruser, contains Tutoruser._id
      isProfileComplete: isProfileComplete,
      status: tutorProfile?.status || null
    });

  } catch (err) {
    console.log("❌ Google OAuth Error:", err.message);
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

// 🔄 UPDATE tutor status (approve/reject)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    res.json({ success: true, message: "Status updated successfully", tutor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ DELETE tutor
router.delete("/:id", auth, async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndDelete(req.params.id);

    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    // Also delete related applications
    const Application = require("../models/Application");
    await Application.deleteMany({ tutorId: req.params.id });

    res.json({ success: true, message: "Tutor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📝 Register tutor (POST /api/tutors)
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, locality, experience, phone } = req.body;

    console.log("📝 Tutor registration request for:", email);
    console.log("Form data:", { name, email, subject, locality, experience: typeof experience, phone });

    // Validation
    if (!name || !email || !subject || !locality || !experience || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if tutor already exists
    const existing = await Tutor.findOne({ email });
    if (existing) {
      console.warn("⚠️ Tutor already exists:", email);
      return res.status(400).json({ message: "Tutor with this email already exists" });
    }

    // Create new tutor
    const tutor = new Tutor({
      name,
      email,
      subject,
      locality,
      experience: parseInt(experience, 10),  // Ensure it's a number
      phone,
      status: "pending",
      profileComplete: true
    });

    await tutor.save();

    console.log("✅ Tutor registered successfully:", {
      id: tutor._id,
      email: tutor.email,
      name: tutor.name,
      status: tutor.status,
      profileComplete: tutor.profileComplete
    });

    res.json({ 
      message: "Tutor registered successfully", 
      tutor,
      success: true 
    });

  } catch (error) {
    console.error("❌ ERROR registering tutor:", error);
    res.status(500).json({ 
      message: "Server error: " + error.message,
      success: false
    });
  }
});

module.exports = router;