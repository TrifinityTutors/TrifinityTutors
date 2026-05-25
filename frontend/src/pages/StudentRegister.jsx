import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import "./StudentRegister.css"

function StudentRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    class: "",
    subject: "",
    locality: "",
    board: "",
    phoneNumber: "",
    exactAddress: ""
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      console.log("Google signup for student initiated");
      // Google login creates/authenticates student
      const response = await fetch("http://localhost:5000/api/students/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        localStorage.setItem("student", JSON.stringify(data.user || {}));
        // Set a temporary token for student access
        localStorage.setItem("token", data.token || `student_${Date.now()}`);
        navigate("/dashboard/student");
      } else {
        // If endpoint doesn't exist, continue with form-based registration
        alert("Google signup will be available soon. Please use the form below.");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      // Silently continue - form is still available
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    if (!form.name.trim() || !form.class.trim() || !form.subject.trim() || !form.locality.trim() || !form.board || !form.phoneNumber.trim() || !form.exactAddress.trim()) {
      alert("❌ Please fill all fields")
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/students/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      })

      const data = await response.json()
      console.log("Response:", data, "Status:", response.status)

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit")
      }

      alert("✅ Student request submitted successfully!")

      // reset form
      setForm({
        name: "",
        class: "",
        subject: "",
        locality: "",
        board: "",
        phoneNumber: "",
        exactAddress: ""
      })

      // Redirect to student dashboard
      navigate("/dashboard/student")
    } catch (error) {
      console.error("Submit error:", error)
      alert("❌ Error submitting form: " + error.message)
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl">👨‍🎓</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Student Registration</h1>
            <p className="subtitle text-gray-600 text-lg">Find the perfect tutor for your learning journey</p>
          </div>

          {/* Google OAuth Option */}
          <div className="mb-8 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => console.log("Google signup error")}
              theme="outline"
              size="large"
            />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
            <div className="h-px flex-1 bg-gray-300" /> OR <div className="h-px flex-1 bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit} className="register-form space-y-6">

            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">👤 Full Name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                placeholder="Enter your full name"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="class" className="block text-sm font-bold text-gray-900 mb-2">📚 Grade/Class *</label>
                <input
                  id="class"
                  name="class"
                  value={form.class}
                  placeholder="e.g., 10th, 12th, University"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">🔬 Subject *</label>
                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  placeholder="e.g., Mathematics, Physics"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="locality" className="block text-sm font-bold text-gray-900 mb-2">📍 Locality *</label>
                <input
                  id="locality"
                  name="locality"
                  value={form.locality}
                  placeholder="Enter your location or area"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
                />
              </div>

              <div className="form-group">
                <label htmlFor="board" className="block text-sm font-bold text-gray-900 mb-2">🎓 Board *</label>
                <select
                  id="board"
                  name="board"
                  value={form.board}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
                >
                  <option value="">Select your board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-900 mb-2">📞 Phone Number *</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                placeholder="Enter your phone number"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400"
              />
            </div>

            <div className="form-group">
              <label htmlFor="exactAddress" className="block text-sm font-bold text-gray-900 mb-2">🏠 Exact Address *</label>
              <textarea
                id="exactAddress"
                name="exactAddress"
                value={form.exactAddress}
                placeholder="Enter your complete address"
                onChange={handleChange}
                rows="3"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-gray-400 resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-8"
            >
              {isLoading ? "🔄 Submitting..." : "✅ Submit Request"}
            </button>

          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already submitted? <a href="/" className="text-blue-600 hover:text-blue-700 font-bold">Back to home</a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Quick Match", desc: "Find tutors in minutes" },
            { icon: "🔒", title: "Safe & Secure", desc: "Verified tutors only" },
            { icon: "💬", title: "Easy Communication", desc: "Direct messaging support" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all text-center">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <p className="font-bold text-gray-900 mb-1">{feature.title}</p>
              <p className="text-xs text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentRegister