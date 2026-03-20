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


app.use("/api", studentRoutes)
// auth routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/tutors", require("./routes/tutorRoutes"));


app.listen(5000, ()=>{
  console.log("Server running on port 5000")
})