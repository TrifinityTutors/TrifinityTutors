const express = require("express");
const router = express.Router();
const Tutor = require("../models/Tutor");
const auth = require("../middleware/auth");
const protectTutor = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Tutoruser = require("../models/Tutoruser");
const upload = require("../middleware/fileUpload");
const fs = require("fs");
const path = require("path");



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


// 📋 GET tutor profile by ID
router.get("/profile/:tutorId", async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    console.log("🔍 Fetching profile for ID:", tutorId);
    
    // Try direct lookup first
    let tutor = await Tutor.findById(tutorId).select("-password");
    
    if (!tutor) {
      console.log("⚠️ Direct lookup failed, trying email-based fallback...");
      
      // If not found, treat ID as Tutoruser._id
      const tutorUser = await Tutoruser.findById(tutorId);
      
      if (!tutorUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("📧 Found Tutoruser, looking up Tutor by email:", tutorUser.email);
      tutor = await Tutor.findOne({ email: tutorUser.email }).select("-password");
      
      if (!tutor) {
        console.log("⚠️ No Tutor profile found for email:", tutorUser.email);
        // Create empty response with user info
        return res.json({
          _id: tutorId,
          name: tutorUser.name,
          email: tutorUser.email,
          photo: tutorUser.photo,
          phone: "",
          subject: "",
          locality: "",
          experience: 0,
          bio: "",
          qualifications: "",
          teachingMethodology: "",
          hourlyRate: 0,
          cvFile: "",
          cvFileName: "",
          verificationStatus: "unverified"
        });
      }
    }

    console.log("✅ Tutor profile retrieved:", tutor.email);
    res.json(tutor);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📝 UPDATE tutor profile
router.put("/profile/:tutorId", async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const { name, bio, qualifications, teachingMethodology, hourlyRate, phone, locality, subject, experience } = req.body;

    console.log("📝 Updating tutor profile:", tutorId);

    // Try direct lookup first
    let tutor = await Tutor.findByIdAndUpdate(
      tutorId,
      {
        name,
        bio,
        qualifications,
        teachingMethodology,
        hourlyRate: parseInt(hourlyRate, 10) || 0,
        phone,
        locality,
        subject,
        experience: parseInt(experience, 10)
      },
      { new: true, runValidators: true }
    );

    // If not found, try email-based lookup
    if (!tutor) {
      console.log("⚠️ Direct lookup failed, trying email-based fallback...");
      const tutorUser = await Tutoruser.findById(tutorId);
      
      if (!tutorUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("📧 Found Tutoruser, updating Tutor by email:", tutorUser.email);
      tutor = await Tutor.findOneAndUpdate(
        { email: tutorUser.email },
        {
          name,
          bio,
          qualifications,
          teachingMethodology,
          hourlyRate: parseInt(hourlyRate, 10) || 0,
          phone,
          locality,
          subject,
          experience: parseInt(experience, 10)
        },
        { new: true, runValidators: true }
      );
    }

    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    console.log("✅ Profile updated successfully:", tutor.email);
    res.json({ 
      message: "Profile updated successfully", 
      tutor 
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📄 UPLOAD CV
router.post("/upload-cv/:tutorId", upload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const tutorId = req.params.tutorId;
    const cvPath = `/uploads/${req.file.filename}`;
    
    console.log("📄 CV uploaded:", req.file.filename, "for tutor:", tutorId);

    // Try direct lookup first
    let tutor = await Tutor.findByIdAndUpdate(
      tutorId,
      {
        cvFile: cvPath,
        cvFileName: req.file.originalname,
        cvUploadedAt: new Date(),
        verificationStatus: "pending"
      },
      { new: true }
    );

    // If not found, try email-based lookup
    if (!tutor) {
      console.log("⚠️ Direct lookup failed, trying email-based fallback...");
      const tutorUser = await Tutoruser.findById(tutorId);
      
      if (!tutorUser) {
        // Delete uploaded file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("📧 Found Tutoruser, updating Tutor by email:", tutorUser.email);
      tutor = await Tutor.findOneAndUpdate(
        { email: tutorUser.email },
        {
          cvFile: cvPath,
          cvFileName: req.file.originalname,
          cvUploadedAt: new Date(),
          verificationStatus: "pending"
        },
        { new: true }
      );
    }

    if (!tutor) {
      // Delete uploaded file if tutor not found
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    console.log("✅ CV saved successfully for tutor:", tutor.email);
    res.json({
      message: "CV uploaded successfully",
      cvFile: cvPath,
      cvFileName: req.file.originalname,
      verificationStatus: "pending"
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    console.error("❌ Error uploading CV:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔗 DOWNLOAD CV
router.get("/download-cv/:tutorId", async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    
    // Try direct lookup first
    let tutor = await Tutor.findById(tutorId);
    
    // If not found, try email-based lookup
    if (!tutor) {
      console.log("⚠️ Direct lookup failed, trying email-based fallback...");
      const tutorUser = await Tutoruser.findById(tutorId);
      
      if (!tutorUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      tutor = await Tutor.findOne({ email: tutorUser.email });
    }

    if (!tutor || !tutor.cvFile) {
      return res.status(404).json({ message: "CV not found" });
    }

    const filePath = path.join(__dirname, "..", tutor.cvFile);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    console.log("📥 CV downloaded:", tutor.cvFileName);
    res.download(filePath, tutor.cvFileName);
  } catch (error) {
    console.error("❌ Error downloading CV:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ REQUEST VERIFICATION
router.post("/request-verification/:tutorId", async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const { bio, qualifications, teachingMethodology } = req.body;

    console.log("✅ Verification request from tutor:", tutorId);

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Check if CV is uploaded
    if (!tutor.cvFile) {
      return res.status(400).json({ message: "Please upload CV before requesting verification" });
    }

    // Update profile and set verification status to pending
    tutor.bio = bio || tutor.bio;
    tutor.qualifications = qualifications || tutor.qualifications;
    tutor.teachingMethodology = teachingMethodology || tutor.teachingMethodology;
    tutor.verificationStatus = "pending";

    await tutor.save();

    console.log("✅ Verification request submitted:", tutor.email);
    res.json({
      message: "Verification request submitted. Admin will review your application soon.",
      verificationStatus: "pending"
    });
  } catch (error) {
    console.error("❌ Error requesting verification:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🛡️ ADMIN: GET ALL VERIFICATIONS (with filter support)
router.get("/verifications", auth, async (req, res) => {
  try {
    const filter = req.query.status || null;
    let query = {};
    
    if (filter && filter !== "all") {
      query.verificationStatus = filter;
    }
    
    const tutors = await Tutor.find(query)
      .select("name email subject experience phone bio qualifications cvFile cvUploadedAt verificationStatus verificationNotes")
      .sort({ cvUploadedAt: -1 });

    console.log("📋 Fetched", tutors.length, "verifications with filter:", filter);
    res.json(tutors);
  } catch (error) {
    console.error("❌ Error fetching verifications:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🛡️ ADMIN: GET PENDING VERIFICATIONS
router.get("/verifications/pending", auth, async (req, res) => {
  try {
    const pendingTutors = await Tutor.find({ verificationStatus: "pending" })
      .select("name email subject experience phone bio qualifications cvFile cvUploadedAt")
      .sort({ cvUploadedAt: -1 });

    console.log("📋 Fetched", pendingTutors.length, "pending verifications");
    res.json(pendingTutors);
  } catch (error) {
    console.error("❌ Error fetching verifications:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🛡️ ADMIN: VERIFY/REJECT TUTOR
router.put("/verify/:tutorId", auth, async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const { verificationStatus, verificationNotes } = req.body;

    if (!["verified", "rejected"].includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    console.log("🛡️ Processing verification for tutor:", tutorId, "Status:", verificationStatus);

    const tutor = await Tutor.findByIdAndUpdate(
      tutorId,
      {
        verificationStatus,
        verificationNotes,
        verifiedAt: new Date(),
        verifiedBy: req.user?.id || "admin"
      },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    console.log("✅ Verification updated:", tutor.email, "-", verificationStatus);
    res.json({
      message: `Tutor ${verificationStatus} successfully`,
      tutor
    });
  } catch (error) {
    console.error("❌ Error verifying tutor:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;