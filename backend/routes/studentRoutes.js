const express = require("express")
const router = express.Router()

const StudentRequest = require("../models/StudentRequest")

const Application = require("../models/Application")

router.post("/student", async (req,res)=>{

  const data = new StudentRequest(req.body)

  await data.save()

  res.json({message:"Student request saved"})

})
router.get("/studentrequests", async (req, res) => {
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

module.exports = router