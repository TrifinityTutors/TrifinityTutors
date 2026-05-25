import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { GoogleLogin } from "@react-oauth/google"

// Helper function to decode JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

function Auth() {
  const navigate = useNavigate()
  const [role, setRole] = useState("student")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    return newErrors
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const endpoint = role === "student" ? "/api/students/register" : "/api/tutors/register"
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        })
      })

      const data = await response.json()
      if (response.ok) {
        // Store token and redirect
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          role: role
        }))
        navigate(role === "student" ? "/student-dashboard" : "/tutor-dashboard")
      } else {
        setErrors({ submit: data.message || "Registration failed" })
      }
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const decoded = decodeJWT(credentialResponse.credential)
      
      if (!decoded) {
        throw new Error("Failed to decode Google token")
      }

      const email = decoded.email
      const name = decoded.name

      // Try to send to backend for Google OAuth registration
      const endpoint = role === "student" ? "/api/students/google-register" : "/api/tutors/google-register"
      
      try {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: name,
            googleId: decoded.sub,
          })
        })

        const data = await response.json()
        if (response.ok) {
          // Store token and user data
          localStorage.setItem("token", data.token || `google-${decoded.sub}`)
          localStorage.setItem("user", JSON.stringify({
            name: name,
            email: email,
            role: role,
            googleId: decoded.sub
          }))
          // Redirect based on role
          navigate(role === "student" ? "/student-dashboard" : "/tutor-dashboard")
          return
        }
      } catch (backendError) {
        console.log("Backend not available, using local auth")
      }

      // Fallback: Use local authentication without backend
      const token = `google-${decoded.sub}-${Date.now()}`
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify({
        name: name,
        email: email,
        role: role,
        googleId: decoded.sub
      }))
      
      // Redirect based on role
      navigate(role === "student" ? "/student-dashboard" : "/tutor-dashboard")
    } catch (error) {
      console.error("Google auth error:", error)
      setErrors({ submit: "Google authentication failed. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT SIDE - BLUE SECTION */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">T</span>
          </div>
          <span className="text-2xl font-bold">Trifinity Tutors</span>
        </Link>

        {/* Main Content */}
        <div className="z-10">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Learn from the best, on your schedule.
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Join 50,000+ students and tutors building skills, growing careers, and unlocking potential together.
          </p>

          {/* Avatars & Trust Badge */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full bg-pink-400 border-4 border-blue-600 flex items-center justify-center text-white font-bold">👩</div>
              <div className="w-12 h-12 rounded-full bg-cyan-400 border-4 border-blue-600 flex items-center justify-center text-white font-bold">👨</div>
              <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-blue-600 flex items-center justify-center text-white font-bold">👩</div>
              <div className="w-12 h-12 rounded-full bg-purple-400 border-4 border-blue-600 flex items-center justify-center text-white font-bold">👨</div>
            </div>
            <p className="text-blue-100 font-medium">Trusted by 50k+ learners worldwide</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-blue-100 z-10">© Trifinity Tutors</p>
      </div>

      {/* RIGHT SIDE - LIGHT BLUE SECTION */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-blue-50 to-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
        {/* Back to home - Mobile visible */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium">
          <span>←</span>
          Back to home
        </Link>

        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Get started in less than a minute.</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Student Card */}
            <button
              onClick={() => setRole("student")}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                role === "student"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">🎓</span>
                {role === "student" && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className={`font-bold mb-1 ${role === "student" ? "text-gray-900" : "text-gray-700"}`}>
                I'm a Student
              </p>
              <p className={`text-sm ${role === "student" ? "text-blue-600" : "text-gray-500"}`}>
                Find tutors
              </p>
            </button>

            {/* Tutor Card */}
            <button
              onClick={() => setRole("tutor")}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                role === "tutor"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">👨‍🏫</span>
                {role === "tutor" && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className={`font-bold mb-1 ${role === "tutor" ? "text-gray-900" : "text-gray-700"}`}>
                I'm a Tutor
              </p>
              <p className={`text-sm ${role === "tutor" ? "text-blue-600" : "text-gray-500"}`}>
                Teach & earn
              </p>
            </button>
          </div>

          {/* Google Sign In */}
          <div className="w-full mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrors({ submit: "Google login failed. Please try again." })
              }}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled || loading}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl font-bold text-gray-900 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <image href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" width="20" height="20" />
                  </svg>
                  Continue with Google
                </button>
              )}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 font-medium text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ananya Rao"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors placeholder-gray-400 focus:outline-none ${
                  errors.fullName
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors placeholder-gray-400 focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors placeholder-gray-400 focus:outline-none ${
                  errors.password
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Terms & Privacy */}
          <p className="text-center text-gray-600 text-sm mt-4">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms
            </a>
            {" "}and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </p>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/tutor-login" className="text-blue-600 hover:text-blue-700 font-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
