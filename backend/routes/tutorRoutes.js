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



// GET all tutors (public listing)
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/tutors called", { query: req.query });
    const filter = { profileComplete: true };
    const tutors = await Tutor.find(filter)
      .select("name email subject subjects locality experience hourlyRate trialRate bio profilePhoto rating reviews tags status profileComplete photo")
      .sort({ createdAt: -1 });

    console.log("All tutors from DB:", tutors);
    console.log(`GET /api/tutors -> found ${tutors.length} tutors`, tutors.map(t => ({ id: t._id, email: t.email, hourlyRate: t.hourlyRate, profileComplete: t.profileComplete, status: t.status })));

    res.json(tutors);
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
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        googleId: user.googleId,
        role: user.role,
      },
      isProfileComplete,
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



router.post("/complete-profile", protectTutor, upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "documents", maxCount: 5 }
]), async (req, res) => {
  try {
    const user = await Tutoruser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      firstName,
      lastName,
      phone,
      city,
      bio,
      qualifications,
      teachingMethodology,
      mainSubject,
      experience,
      hourlyRate,
      trialRate,
      education,
      subjects: subjectsRaw
    } = req.body;

    const subjects = typeof subjectsRaw === "string"
      ? JSON.parse(subjectsRaw || "[]")
      : Array.isArray(subjectsRaw)
      ? subjectsRaw
      : [];

    const errors = [];
    if (!firstName?.trim()) errors.push("First name is required");
    if (!lastName?.trim()) errors.push("Last name is required");
    if (!phone?.trim()) errors.push("Phone is required");
    if (!city?.trim()) errors.push("City is required");
    if (!mainSubject?.trim()) errors.push("Primary subject is required");
    if (!experience || isNaN(parseInt(experience, 10)) || parseInt(experience, 10) < 1) errors.push("Experience is required");
    if (!hourlyRate || isNaN(parseFloat(hourlyRate))) errors.push("Hourly rate is required");
    if (!bio?.trim()) errors.push("Bio is required");
    if (!qualifications?.trim()) errors.push("Qualifications are required");
    if (!req.files || !req.files.profilePhoto || !req.files.profilePhoto.length) errors.push("Profile photo upload is required");

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profilePhotoFile = req.files.profilePhoto?.[0];
    const profilePhotoUrl = profilePhotoFile ? `${baseUrl}/uploads/${profilePhotoFile.filename}` : user.photo || "";

    const documentFiles = (req.files.documents || []).map((file) => ({
      fileName: file.filename,
      originalName: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    }));

    const existingTutor = await Tutor.findOne({ email: user.email });
    const tutorData = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: user.email,
      subject: mainSubject,
      subjects,
      locality: city,
      experience: parseInt(experience, 10),
      phone: phone.trim(),
      bio: bio.trim(),
      qualifications: qualifications.trim(),
      teachingMethodology: teachingMethodology?.trim() || "",
      hourlyRate: parseFloat(hourlyRate),
      trialRate: parseFloat(trialRate) || 0,
      education: education?.trim() || "",
      profilePhoto: profilePhotoUrl,
      documents: documentFiles,
      profileComplete: true,
      status: "pending",
      verificationStatus: "pending",
      tags: subjects.slice(0, 5),
      photo: profilePhotoUrl,
    };

    let tutor;
    if (existingTutor) {
      tutor = await Tutor.findByIdAndUpdate(existingTutor._id, tutorData, { new: true, runValidators: true });
    } else {
      tutor = await Tutor.create(tutorData);
    }

    res.json({ success: true, message: "Tutor profile completed", tutor });
  } catch (error) {
    console.error("❌ Failed to complete tutor profile:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
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
          profilePhoto: tutorUser.photo || "",
          phone: "",
          subject: "",
          subjects: [],
          locality: "",
          experience: 0,
          bio: "",
          qualifications: "",
          teachingMethodology: "",
          education: "",
          hourlyRate: 0,
          availability: [],
          documents: [],
          cvFile: "",
          cvFileName: "",
          profileComplete: false,
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
router.put("/profile/:tutorId", upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "documents", maxCount: 5 }
]), async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const {
      name,
      bio,
      qualifications,
      teachingMethodology,
      hourlyRate,
      phone,
      locality,
      subject,
      experience,
      education,
      subjects: subjectsRaw,
      availability: availabilityRaw
    } = req.body;

    const subjects = typeof subjectsRaw === "string"
      ? subjectsRaw.trim().length === 0
        ? []
        : subjectsRaw.split(",").map((item) => item.trim()).filter(Boolean)
      : Array.isArray(subjectsRaw)
        ? subjectsRaw
        : [];

    const availability = typeof availabilityRaw === "string"
      ? availabilityRaw.trim().length === 0
        ? []
        : availabilityRaw.split(",").map((item) => item.trim()).filter(Boolean)
      : Array.isArray(availabilityRaw)
        ? availabilityRaw
        : [];

    console.log("📝 Updating tutor profile:", tutorId);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profilePhotoFile = req.files?.profilePhoto?.[0];
    const profilePhotoUrl = profilePhotoFile ? `${baseUrl}/uploads/${profilePhotoFile.filename}` : undefined;

    const documentFiles = (req.files?.documents || []).map((file) => ({
      fileName: file.filename,
      originalName: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    }));

    const updateData = {
      ...(name !== undefined ? { name } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(qualifications !== undefined ? { qualifications } : {}),
      ...(teachingMethodology !== undefined ? { teachingMethodology } : {}),
      ...(education !== undefined ? { education } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(locality !== undefined ? { locality } : {}),
      ...(subject !== undefined ? { subject } : {}),
      ...(experience !== undefined ? { experience: parseInt(experience, 10) || 0 } : {}),
      ...(hourlyRate !== undefined ? { hourlyRate: parseFloat(hourlyRate) || 0 } : {}),
      ...(subjects.length ? { subjects } : {}),
      ...(availability.length ? { availability } : {}),
      profileComplete: true,
    };

    if (profilePhotoUrl) {
      updateData.profilePhoto = profilePhotoUrl;
      updateData.photo = profilePhotoUrl;
    }

    let tutor = await Tutor.findById(tutorId);
    let tutorUser = null;
    if (!tutor) {
      console.log("⚠️ Direct lookup failed, trying email-based fallback...");
      tutorUser = await Tutoruser.findById(tutorId);
      if (tutorUser) {
        tutor = await Tutor.findOne({ email: tutorUser.email });
      }
    }

    if (!tutor && !tutorUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!tutor) {
      // Create a new tutor profile if none exists yet
      console.log("📧 No existing Tutor profile found. Creating new Tutor for email:", tutorUser.email);
      tutor = await Tutor.create({
        name: name || tutorUser.name,
        email: tutorUser.email,
        photo: profilePhotoUrl || tutorUser.photo || "",
        profilePhoto: profilePhotoUrl || tutorUser.photo || "",
        subject: subject || "",
        locality: locality || "",
        experience: parseInt(experience, 10) || 0,
        phone: phone || "",
        bio: bio || "",
        qualifications: qualifications || "",
        teachingMethodology: teachingMethodology || "",
        education: education || "",
        hourlyRate: parseFloat(hourlyRate) || 0,
        subjects,
        availability,
        documents: documentFiles,
        profileComplete: true,
        status: "pending",
        verificationStatus: "pending",
      });
    } else {
      if (documentFiles.length) {
        updateData.documents = [...(tutor.documents || []), ...documentFiles];
      }
      tutor = await Tutor.findByIdAndUpdate(tutor._id, updateData, { new: true, runValidators: true });
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