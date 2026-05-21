import { useState } from "react"
import "./StudentRegister.css"

function StudentRegister() {

  const [form, setForm] = useState({
    name: "",
    class: "",
    subject: "",
    locality: ""
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    if (!form.name.trim() || !form.class.trim() || !form.subject.trim() || !form.locality.trim()) {
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
        locality: ""
      })
    } catch (error) {
      console.error("Submit error:", error)
      alert("❌ Error submitting form: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h1>Student Registration</h1>
          <p className="subtitle">Find the perfect tutor for your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              placeholder="Enter your full name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Grade/Class</label>
            <input
              id="class"
              name="class"
              value={form.class}
              placeholder="e.g., 10th, 12th, University"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              value={form.subject}
              placeholder="e.g., Mathematics, Physics, English"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="locality">Locality</label>
            <input
              id="locality"
              name="locality"
              value={form.locality}
              placeholder="Enter your location or area"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Request"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default StudentRegister