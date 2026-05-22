import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import StudentRegister from "./pages/StudentRegister"
import TutorRegister from "./pages/TutorRegister"
import TutorDashboard from "./pages/TutorDashboard"

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Students from "./admin/pages/Students";
import Tutors from "./admin/pages/Tutors";
import Verifications from "./admin/pages/Verifications";
import AdminRoute from "./admin/components/AdminRoute";

import TutorLogin from "./pages/TutorLogin"
import MyApplications from "./pages/MyApplications"
import TutorProfile from "./pages/TutorProfile"
import Navbar from "./components/Navbar"
import MainLayout from "./layouts/MainLayout"

import CompleteProfile from "./pages/CompleteProfile";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* USER ROUTES WITH LAYOUT */}

        <Route path="/" element={
          <PublicRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </PublicRoute>
        } />

        <Route path="/student-register" element={
          <MainLayout>
            <StudentRegister />
          </MainLayout>
        } />

        <Route
          path="/tutor-register"
          element={
            <MainLayout>
              <ProtectedRoute>
                <TutorRegister />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        <Route path="/dashboard" element={
          <MainLayout>
            <TutorDashboard />
          </MainLayout>
        } />

        <Route path="/tutor-dashboard" element={
          <MainLayout>
            <TutorDashboard />
          </MainLayout>
        } />

        <Route path="/my-applications" element={
          <MainLayout>
            <MyApplications />
          </MainLayout>
        } />

        {/* LOGIN (NO NAVBAR) */}
        <Route path="/tutor-login" element={<TutorLogin />} />

        {/* ADMIN (NO USER NAVBAR) */}
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

        <Route path="/admin/verifications" element={
          <AdminRoute>
            <Verifications />
          </AdminRoute>
        } />

        <Route path="/complete-profile" element={
          <MainLayout>
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/tutor-profile" element={
          <MainLayout>
            <ProtectedRoute>
              <TutorProfile />
            </ProtectedRoute>
          </MainLayout>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App