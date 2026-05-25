import { BrowserRouter, Routes, Route } from "react-router-dom"

import LandingPage from "./routes/index"
import StudentRegister from "./pages/StudentRegister"
import RegisterTutor from "./routes/register-tutor"
import TutorDashboard from "./pages/TutorDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import Tutors from "./pages/Tutors"
import Auth from "./pages/Auth"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"

import Login from "./admin/pages/Login";
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
            <LandingPage />
          </PublicRoute>
        } />

        <Route path="/auth" element={
          <Auth />
        } />

        <Route path="/auth/login" element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        } />

        <Route path="/auth/signup" element={
          <MainLayout>
            <SignupPage />
          </MainLayout>
        } />

        <Route path="/student-register" element={
          <MainLayout>
            <StudentRegister />
          </MainLayout>
        } />

        <Route path="/register-tutor" element={
          <RegisterTutor />
        } />

        <Route path="/tutor-register" element={
          <RegisterTutor />
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <TutorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/tutor-dashboard" element={
          <ProtectedRoute>
            <TutorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student-dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/tutor" element={
          <ProtectedRoute>
            <TutorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/my-applications" element={
          <MainLayout>
            <MyApplications />
          </MainLayout>
        } />

        <Route path="/tutors" element={
          <Tutors />
        } />

        {/* LOGIN (NO NAVBAR) */}
        <Route path="/tutor-login" element={<TutorLogin />} />

        {/* ADMIN (NO USER NAVBAR) */}
        <Route path="/admin-login" element={<Login />} />

        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
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