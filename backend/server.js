require("dotenv").config()

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const studentRoutes = require("./routes/studentRoutes")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Atlas Connected"))
.catch(err=>console.log(err))

<<<<<<< HEAD
app.use("/api", studentRoutes)  // ✅ ONLY THIS
=======
app.use("/api", studentRoutes)
// auth routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/tutors", require("./routes/tutorRoutes"));
>>>>>>> 8a3a93c937bd4552795e4712196c355c75ee931e

app.listen(5000, ()=>{
  console.log("Server running on port 5000")
})