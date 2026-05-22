import { useState, useEffect } from "react"
import "./StudentCard.css"

function StudentCard({ data }) {

  const [applied, setApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tutor = JSON.parse(localStorage.getItem("tutor"))

  // Check if tutor has already applied for this student on component mount
  useEffect(() => {
    if (tutor && tutor._id && data._id) {
      checkIfAlreadyApplied()
    }
  }, [data._id, tutor])

  const checkIfAlreadyApplied = async () => {
    try {
      // We'll check by trying to fetch and seeing if an application exists
      // This is called by comparing with applications
      const response = await fetch(
        `http://localhost:5000/api/students/tutor/${tutor._id}`
      )
      const applications = await response.json()
      
      // Check if this student already has an application from this tutor
      const hasApplied = applications.some(
        app => app.studentRequestId?._id === data._id
      )
      
      if (hasApplied) {
        setApplied(true)
      }
    } catch (error) {
      console.log("Could not check application status:", error)
      // Silent fail - just show apply button
    }
  }

  const handleApply = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const tutor = JSON.parse(localStorage.getItem("tutor"))

      console.log("🎯 Apply clicked - Tutor data:", {
        tutorId: tutor?._id,
        tutorEmail: tutor?.email,
        tutorName: tutor?.name,
        profileComplete: tutor?.profileComplete,
        status: tutor?.status
      });
      console.log("📚 Student data:", { studentId: data._id, studentName: data.name });

      if (!token || !tutor) {
        alert("Please login to apply")
        return
      }

      // Use email as primary identifier, with fallback to ID
      if (!tutor.email && !tutor._id) {
        alert("Invalid tutor data")
        return
      }

      const payloadData = {
        tutorId: tutor._id,
        tutorEmail: tutor.email,
        studentRequestId: data._id
      };
      
      console.log("📤 Sending apply request with:", payloadData);

      const response = await fetch("http://localhost:5000/api/students/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payloadData)
      })

      const result = await response.json()
      console.log("✅ Apply response:", result)

      if (result.message === "Already applied") {
        setApplied(true)
        alert("You have already applied for this student")
      } else if (result.message === "Application submitted") {
        setApplied(true)
        alert("✅ " + result.message)
      } else {
        alert(result.message || "Application submitted")
        setApplied(true)
      }

    } catch (error) {
      console.error("❌ Apply Error:", error)
      alert("Error submitting application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="student-card">
      <div className="card-content">
        <h2 className="student-name">{data.name}</h2>
        
        <div className="student-info">
          <div className="info-item">
            <span className="label">📚 Grade:</span>
            <span className="value">{data.class}</span>
          </div>

          <div className="info-item">
            <span className="label">🎓 Subject:</span>
            <span className="value">{data.subject}</span>
          </div>

          <div className="info-item">
            <span className="label">📍 Board:</span>
            <span className="value">{data.board || "N/A"}</span>
          </div>

          <div className="info-item">
            <span className="label">📍 Location:</span>
            <span className="value">{data.locality}</span>
          </div>

          <div className="info-item">
            <span className="label">⏰ Time:</span>
            <span className="value">{data.time || "Flexible"}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={applied || isLoading}
        className={`apply-btn ${applied ? 'applied' : ''}`}
      >
        {isLoading ? "Applying..." : applied ? "✓ Applied" : "Apply Now"}
      </button>
    </div>
  )
}

export default StudentCard