require("dotenv").config()

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")

const studentRoutes = require("./routes/studentRoutes")
const tutorRoutes = require("./routes/tutorRoutes");

const app = express()

app.use(cors())
app.use(express.json())

// Serve uploads folder as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Atlas Connected"))
.catch(err=>console.log(err))

// routes
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/auth", require("./routes/auth"));

app.listen(5000, ()=>{
  console.log("Server running on port 5000")
})