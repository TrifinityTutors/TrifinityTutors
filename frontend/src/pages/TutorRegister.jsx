import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./TutorRegister.css"

function TutorRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    locality: "",
    experience: "",
    phone: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Pre-fill form with Google login data
  useEffect(() => {
    const tutorData = localStorage.getItem("tutor")
    if (tutorData) {
      try {
        const tutor = JSON.parse(tutorData)
        setForm(prev => ({
          ...prev,
          name: tutor.name || "",
          email: tutor.email || ""
        }))
      } catch (err) {
        console.error("Error parsing tutor data:", err)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  // Validate all fields
  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = "Full name is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    if (!form.subject.trim()) newErrors.subject = "Subject is required"
    if (!form.locality.trim()) newErrors.locality = "Locality is required"
    if (!form.experience || form.experience <= 0) newErrors.experience = "Years of experience is required"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate before submitting
    if (!validateForm()) {
      alert("Please fill all required fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...form,
          experience: parseInt(form.experience, 10)  // Convert experience to number
        })
      })

      const data = await response.json()

      if (response.ok || data.message === "Tutor registered successfully") {
        alert("✅ Registration successful! Redirecting to dashboard...")
        
        // Update localStorage with the newly created tutor data
        const currentTutor = JSON.parse(localStorage.getItem("tutor"))
        if (currentTutor && data.tutor) {
          // Merge the new tutor data with stored data
          localStorage.setItem("tutor", JSON.stringify({
            ...currentTutor,
            ...data.tutor,
            _id: data.tutor._id  // Ensure we have the Tutor model ID
          }))
          console.log("Updated tutor data in localStorage:", data.tutor)
        }
        
        // Clear form
        setForm({
          name: "",
          email: "",
          subject: "",
          locality: "",
          experience: "",
          phone: ""
        })
        // Redirect to dashboard
        navigate("/dashboard")
      } else {
        alert("❌ " + (data.message || "Registration failed"))
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("❌ Error registering tutor: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 py-12">
      {/* Background Elements */}
      <div className="fixed top-0 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-0 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>

      <div className="register-wrapper max-w-2xl mx-auto relative">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="register-header text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl">👨‍🏫</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Tutor Registration</h1>
            <p className="subtitle text-gray-600 text-lg">Complete your profile to start tutoring</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form space-y-6">

            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">👤 Full Name *</label>
              <input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-gray-400 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <span className="text-red-600 text-sm font-medium mt-1 inline-block">❌ {errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">📧 Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email from your account"
                value={form.email}
                onChange={handleChange}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              {errors.email && <span className="text-red-600 text-sm font-medium mt-1 inline-block">❌ {errors.email}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">📚 Subject *</label>
                <input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Mathematics"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-gray-400 ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.subject && <span className="text-red-600 text-sm font-medium mt-1 inline-block">❌ {errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="experience" className="block text-sm font-bold text-gray-900 mb-2">⭐ Experience (Years) *</label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  placeholder="e.g., 5"
                  value={form.experience}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-gray-400 ${
                    errors.experience ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.experience && <span className="text-red-600 text-sm font-medium mt-1 inline-block">❌ {errors.experience}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="locality" className="block text-sm font-bold text-gray-900 mb-2">📍 Locality *</label>
                <input
                  id="locality"
                  name="locality"
                  placeholder="Enter your location"
                  value={form.locality}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-gray-400 ${
                    errors.locality ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.locality && <span className="text-red-600 text-sm font-medium mt-1 inline-block">❌ {errors.locality}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">📞 Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-gray-400 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && <span className="text-red-600 text-sm font-medium mt-1 inline-block">❌ {errors.phone}</span>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-8"
            >
              {isLoading ? "🔄 Registering..." : "✅ Register as Tutor"}
            </button>

          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already registered? <a href="/tutor-login" className="text-green-600 hover:text-green-700 font-bold">Sign in here</a>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💰", title: "Earn Money", desc: "Set your own rates" },
            { icon: "🕐", title: "Flexible Hours", desc: "Work at your pace" },
            { icon: "🌟", title: "Help Students", desc: "Make a difference" }
          ].map((benefit, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all text-center">
              <div className="text-4xl mb-3">{benefit.icon}</div>
              <p className="font-bold text-gray-900 mb-1">{benefit.title}</p>
              <p className="text-xs text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TutorRegister