const express = require("express")
const router = express.Router()

const StudentRequest = require("../models/StudentRequest")

const Application = require("../models/Application")
const Tutor = require("../models/Tutor")

const auth = require("../middleware/auth");

router.post("/student", async (req,res)=>{

  const data = new StudentRequest(req.body)

  await data.save()

  res.json({message:"Student request saved"})

})
router.get("/", async (req, res) => {
  try {
    const data = await StudentRequest.find()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/apply", async (req, res) => {

  try {

    const { tutorName, studentRequestId } = req.body

    const existing = await Application.findOne({
      tutorName,
      studentRequestId
    })

    if (existing) {
      return res.json({ message: "Already applied" })
    }

    const application = new Application({
      tutorName,
      studentRequestId
    })

    await application.save()

    res.json({ message: "Application submitted" })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }

})

router.post("/tutor", async (req, res) => {

  try {

    const tutor = new Tutor(req.body)

    await tutor.save()

    res.json({ message: "Tutor registered successfully" })

  } catch (error) {

    console.error(error)

    res.status(500).json({ message: "Server error" })

  }

})

router.post("/tutor-login", async (req,res)=>{

  const {email,password} = req.body

  const tutor = await Tutor.findOne({email})

  if(!tutor){
    return res.json({message:"Tutor not found"})
  }

  if(tutor.password !== password){
    return res.json({message:"Incorrect password"})
  }

  res.json({
    message:"Login successful",
    tutor
  })
})

module.exports = router