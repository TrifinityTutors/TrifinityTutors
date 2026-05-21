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
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h1>Tutor Registration</h1>
          <p className="subtitle">Complete your profile to start tutoring</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email from Google account"
              value={form.email}
              onChange={handleChange}
              readOnly
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                id="subject"
                name="subject"
                placeholder="e.g., Mathematics"
                value={form.subject}
                onChange={handleChange}
                required
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience (Years) *</label>
              <input
                id="experience"
                name="experience"
                type="number"
                placeholder="e.g., 5"
                value={form.experience}
                onChange={handleChange}
                required
              />
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="locality">Locality *</label>
              <input
                id="locality"
                name="locality"
                placeholder="Enter your location"
                value={form.locality}
                onChange={handleChange}
                required
              />
              {errors.locality && <span className="error-message">{errors.locality}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register as Tutor"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default TutorRegister