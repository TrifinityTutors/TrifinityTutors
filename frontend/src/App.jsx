import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import StudentRegister from "./pages/StudentRegister"
import TutorRegister from "./pages/TutorRegister"
import TutorDashboard from "./pages/TutorDashboard"

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Students from "./admin/pages/Students";
import Tutors from "./admin/pages/Tutors";
import AdminRoute from "./admin/components/AdminRoute";

import TutorLogin from "./pages/TutorLogin"
import MyApplications from "./pages/MyApplications"
import Navbar from "./components/Navbar"

function App() {
  return (
    <BrowserRouter>

      <Navbar />   {/* ✅ THIS IS MISSING */}

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/tutor-register" element={<TutorRegister />} />
        <Route path="/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor-login" element={<TutorLogin/>}/>
        <Route path="/my-applications" element={<MyApplications />} />

        <Route path="/admin-login" element={<Login />} />

        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />

        <Route path="/admin/students" element={
          <AdminRoute>
            <Students />
          </AdminRoute>
        } />

        <Route path="/admin/tutors" element={
          <AdminRoute>
            <Tutors />
          </AdminRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App