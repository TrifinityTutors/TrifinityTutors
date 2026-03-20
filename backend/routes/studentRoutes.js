const express = require("express")
const router = express.Router()

const StudentRequest = require("../models/StudentRequest")
const Application = require("../models/Application")
const Tutor = require("../models/Tutor")

// ================= STUDENT =================

// Create student request
router.post("/student", async (req, res) => {
  const data = new StudentRequest(req.body)
  await data.save()
  res.json({ message: "Student request saved" })
})

// Get all student requests
router.get("/studentrequests", async (req, res) => {
  try {
    const data = await StudentRequest.find()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ================= TUTOR =================

// Register tutor
router.post("/tutor", async (req, res) => {
  try {
    const tutor = new Tutor(req.body)
    await tutor.save()
    res.json({ message: "Tutor registered successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

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

  res.json({
    message: "Login successful",
    tutor
  })
})


// ================= APPLICATION =================

// Apply to student
router.post("/apply", async (req, res) => {
  try {
    const { tutorId, studentRequestId } = req.body

    // prevent duplicate
    const existing = await Application.findOne({
      tutorId,
      studentRequestId
    })

    if (existing) {
      return res.json({ message: "Already applied" })
    }

    const application = new Application({
      tutorId,
      studentRequestId,
      status: "pending"
    })

    await application.save()

    res.json({ message: "Application submitted" })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// Get tutor applications (MyApplications)
router.get("/tutor/:tutorId", async (req, res) => {
  try {
    const data = await Application.find({
      tutorId: req.params.tutorId
    }).populate("studentRequestId")

    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router