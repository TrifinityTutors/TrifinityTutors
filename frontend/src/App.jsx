import { BrowserRouter, Routes, Route } from "react-router-dom"

import LandingPage from "./routes/index"
import StudentRegister from "./pages/StudentRegister"
import RegisterTutor from "./routes/register-tutor"
import TutorDashboard from "./pages/TutorDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import Tutors from "./pages/Tutors"
import AuthLayout from "./routes/auth"
import SignupPage from "./routes/auth.signup"
import LoginPage from "./routes/auth.login"

import Login from "./admin/pages/Login";
import AdminRoute from "./admin/components/AdminRoute";

import TutorLogin from "./pages/TutorLogin"
import MyApplications from "./pages/MyApplications"
import TutorProfile from "./pages/TutorProfile"
import StudentProfile from "./pages/StudentProfile"
import EditProfile from "./pages/EditProfile"
import TutorSchedule from "./pages/TutorSchedule"
import TutorDetails from "./pages/TutorDetails"
import MessagePage from "./pages/MessagePage"
import BookingSession from "./pages/BookingSession"
import Checkout from "./pages/Checkout"
import MainLayout from "./layouts/MainLayout"

import CompleteProfile from "./pages/CompleteProfile";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import StudentBookings from "./pages/StudentBookings";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* USER ROUTES WITH LAYOUT */}

        <Route path="/" element={
          <MainLayout>
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          </MainLayout>
        } />

        <Route path="/auth" element={
          <AuthLayout />
        }>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        <Route path="/student-register" element={
          <MainLayout>
            <StudentRegister />
          </MainLayout>
        } />

        <Route path="/register-tutor" element={
          <MainLayout>
            <RegisterTutor />
          </MainLayout>
        } />

        <Route path="/tutor-register" element={
          <MainLayout>
            <RegisterTutor />
          </MainLayout>
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
          <MainLayout>
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />


        <Route path="/dashboard/student/bookings" element={
          <MainLayout>
            <ProtectedRoute>
              <StudentBookings />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/dashboard/student" element={
          <MainLayout>
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/dashboard/tutor" element={
          <ProtectedRoute>
            <TutorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/tutor/schedule" element={
          <MainLayout>
            <ProtectedRoute>
              <TutorSchedule />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/my-applications" element={
          <MainLayout>
            <MyApplications />
          </MainLayout>
        } />

        <Route path="/tutors" element={
          <MainLayout>
            <Tutors />
          </MainLayout>
        } />
        <Route path="/tutors/:id" element={
          <MainLayout>
            <TutorDetails />
          </MainLayout>
        } />
        <Route path="/messages/:id" element={
          <MainLayout>
            <ProtectedRoute>
              <MessagePage />
            </ProtectedRoute>
          </MainLayout>
        } />
        <Route path="/booking/:id" element={
          <MainLayout>
            <ProtectedRoute>
              <BookingSession />
            </ProtectedRoute>
          </MainLayout>
        } />
        <Route path="/checkout" element={
          <MainLayout>
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </MainLayout>
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
          <ProtectedRoute>
            <TutorProfile />
          </ProtectedRoute>
        } />

        <Route path="/student/profile" element={
          <MainLayout>
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/student/edit-profile" element={
          <MainLayout>
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          </MainLayout>
        } />

       
         

      </Routes>
    </BrowserRouter>
  )
}

export default App