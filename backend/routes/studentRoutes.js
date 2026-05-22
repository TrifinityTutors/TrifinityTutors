const express = require("express")
const router = express.Router()

const StudentRequest = require("../models/StudentRequest")
const Application = require("../models/Application")
const Tutor = require("../models/Tutor")

const auth = require("../middleware/auth");

// ================= STUDENT =================

// Create student request
router.post("/student", async (req, res) => {
  try {
    const { name, class: studentClass, subject, locality, board, phoneNumber, exactAddress } = req.body
    
    // Validate required fields
    if (!name || !studentClass || !subject || !locality || !board || !phoneNumber || !exactAddress) {
      return res.status(400).json({ 
        error: "All fields are required (name, class, subject, locality, board, phoneNumber, exactAddress)" 
      })
    }
    
    const data = new StudentRequest({
      name: name.trim(),
      class: studentClass.trim(),
      subject: subject.trim(),
      locality: locality.trim(),
      board: board.trim(),
      phoneNumber: phoneNumber.trim(),
      exactAddress: exactAddress.trim()
    })
    
    await data.save()
    console.log("Student request saved:", data)
    
    res.json({ 
      message: "Student request saved",
      success: true,
      studentId: data._id
    })
  } catch (error) {
    console.error("Error saving student request:", error)
    res.status(500).json({ 
      error: error.message || "Error saving student request",
      success: false
    })
  }
})
router.get("/studentrequests", async (req, res) => {
  try {
    const data = await StudentRequest.find()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ GET students with applications
router.get("/with-applications", async (req, res) => {
  try {
    const students = await StudentRequest.find();

    // Get all applications with populated tutor data
    const applications = await Application.find().populate({
      path: "tutorId",
      select: "name email subject"
    });

    console.log("Total applications found:", applications.length);

    const data = students.map(student => {
      const studentApps = applications
        .filter(app => app.studentRequestId && app.studentRequestId.toString() === student._id.toString())
        .map(app => {
          // Debug: log if tutor data is missing
          if (!app.tutorId) {
            console.warn(`⚠️ Application ${app._id} has no tutorId or tutor not found`);
          }
          if (!app.tutorId?.name) {
            console.warn(`⚠️ Tutor ${app.tutorId?._id} has no name field`);
          }

          return {
            _id: app._id,
            tutorId: app.tutorId?._id || "No ID",
            tutorName: app.tutorId?.name || (app.tutorId?._id ? "Name Missing" : "Unknown Tutor"),
            tutorEmail: app.tutorId?.email || "No Email",
            status: app.status,
            createdAt: app.createdAt
          };
        });

      return {
        ...student._doc,
        applications: studentApps
      };
    });

    res.json(data);

  } catch (err) {
    console.error("Error fetching students with applications:", err);
    res.status(500).json({ error: err.message });
  }
});


// GET student count
router.get("/count", async (req, res) => {
  try {
    const count = await StudentRequest.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= TUTOR =================

// Register tutor
router.post("/tutor", async (req, res) => {
  try {
    const { name, email, subject, locality, experience, phone } = req.body;

    // 🔥 validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email required" });
    }

    const existing = await Tutor.findOne({ email });
    if (existing) {
      return res.json({ message: "Tutor already exists" });
    }

    const tutor = new Tutor({
      name,
      email,
      subject,
      locality,
      experience,
      phone,
      status: "pending"
    });

    await tutor.save();

    res.json({ message: "Tutor registered successfully", tutor });

  } catch (error) {
    console.log("ERROR:", error); // 🔥 IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
});

// Tutor login
router.post("/tutor-login", async (req, res) => {
  const { email, password } = req.body

  const tutor = await Tutor.findOne({ email })

  if (!tutor) {
    return res.json({ message: "Tutor not found" })
  }

  if (tutor.password !== password) {
    return res.json({ message: "Incorrect password" })
  }

  // Generate a simple token (in production, use JWT)
  const token = `token_${tutor._id}_${Date.now()}`

  res.json({
    message: "Login successful",
    token: token,
    user: tutor
  })
})


// ================= APPLICATION =================

// Apply to student
router.post("/apply", async (req, res) => {
  try {
    const { tutorId, studentRequestId, tutorEmail } = req.body;

    console.log("Apply request received:", { tutorId, studentRequestId, tutorEmail });

    if (!studentRequestId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    // If email is provided, look up the tutor by email
    let actualTutorId = tutorId;
    if (tutorEmail) {
      const tutor = await Tutor.findOne({ email: tutorEmail });
      if (tutor) {
        actualTutorId = tutor._id;
        console.log("Found tutor by email:", tutor.name, tutor._id, "Status:", tutor.status);
      } else {
        console.warn("Tutor not found by email:", tutorEmail);
        console.log("Available tutors with this email pattern:");
        const allTutors = await Tutor.find({ email: tutorEmail });
        console.log("Exact match tutors:", allTutors);
      }
    }

    if (!actualTutorId) {
      return res.status(400).json({ message: "Invalid tutor ID" });
    }

    const existing = await Application.findOne({
      tutorId: actualTutorId,
      studentRequestId
    });

    if (existing) {
      console.log("Application already exists:", existing._id);
      return res.json({ message: "Already applied" });
    }

    const application = new Application({
      tutorId: actualTutorId,
      studentRequestId
    });

    await application.save();
    console.log("✅ Application created successfully:", {
      applicationId: application._id,
      tutorId: actualTutorId,
      studentRequestId: studentRequestId,
      status: application.status
    });

    res.json({ message: "Application submitted" });

  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ error: err.message });
  }
});


// Get tutor applications (MyApplications)
router.get("/tutor/:tutorId", async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    
    console.log("🔍 Fetching applications for tutor ID:", tutorId);

    // First, try to find applications by the provided ID (assumes it's Tutor._id)
    let data = await Application.find({
      tutorId: tutorId
    }).populate("studentRequestId");

    console.log(`Direct lookup: Found ${data.length} applications`);

    // If no applications found, the ID might be from Tutoruser, so try email-based lookup
    if (data.length === 0) {
      console.log("Direct lookup found nothing, attempting Tutoruser->Tutor lookup...");
      
      try {
        const Tutoruser = require("../models/Tutoruser");
        const tutoruser = await Tutoruser.findById(tutorId);
        
        if (tutoruser && tutoruser.email) {
          console.log("Found Tutoruser:", tutoruser.name, "Email:", tutoruser.email);
          
          const tutor = await Tutor.findOne({ email: tutoruser.email });
          
          if (tutor) {
            console.log("✅ Found Tutor by email lookup:", tutor.name, "ID:", tutor._id);
            
            data = await Application.find({
              tutorId: tutor._id
            }).populate("studentRequestId");
            
            console.log(`Email-based lookup: Found ${data.length} applications for tutor ${tutor._id}`);
          } else {
            console.warn("⚠️ Tutor not found by email:", tutoruser.email);
          }
        } else {
          console.warn("⚠️ Tutoruser not found with ID:", tutorId);
        }
      } catch (tutorLookupErr) {
        console.error("Error during Tutoruser lookup:", tutorLookupErr.message);
      }
    }

    console.log(`Total applications to return: ${data.length}`);
    
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ APPROVE tutor application
router.put("/approve/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // mark approved
    application.status = "approved";
    await application.save();

    res.json({ msg: "Approved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ❌ REJECT tutor application
router.put("/reject/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // option 1: delete application
    await Application.findByIdAndDelete(applicationId);

    res.json({ msg: "Application rejected and removed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// delete application (admin)
// ❌ DELETE student
router.delete("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    // delete student
    await StudentRequest.findByIdAndDelete(studentId);

    // also delete related applications (important)
    await Application.deleteMany({
      studentRequestId: studentId
    });

    res.json({ msg: "Student deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📊 GET student count
router.get("/count", async (req, res) => {
  try {
    const count = await StudentRequest.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 GET tutor count
router.get("/tutor-count", async (req, res) => {
  try {
    const count = await Tutor.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router