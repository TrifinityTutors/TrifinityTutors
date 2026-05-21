import { useEffect, useState } from "react"
import axios from "axios"
import "./MyApplications.css"

function MyApplications() {

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tutor = JSON.parse(localStorage.getItem("tutor"))

  useEffect(() => {
    if (!tutor || !tutor._id) {
      setError("Tutor data not found. Please log in again.")
      setLoading(false)
      return
    }
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      console.log("📋 Fetching applications for tutor:", {
        tutorId: tutor?._id,
        tutorEmail: tutor?.email,
        tutorName: tutor?.name,
        hasProfileComplete: tutor?.profileComplete,
        tutorStatus: tutor?.status
      });
      
      const res = await axios.get(
        `http://localhost:5000/api/students/tutor/${tutor._id}`
      )
      
      console.log(`✅ Retrieved ${res.data.length} applications:`, res.data.map(app => ({
        applicationId: app._id,
        studentName: app.studentRequestId?.name,
        studentId: app.studentRequestId?._id,
        status: app.status
      })))
      
      setApplications(res.data)
      setError(null)
    } catch (err) {
      console.error("❌ Error fetching applications:", err)
      setError(err.response?.data?.message || err.message || "Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <div>
          <h1>My Applications</h1>
          <p className="subtitle">Track your student requests and application status</p>
        </div>
        <button onClick={fetchApplications} className="btn-refresh" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading applications...</div>
      ) : error ? (
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p>Error loading applications</p>
          <p className="error-subtitle">{error}</p>
          <button onClick={fetchApplications}>Retry</button>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p>No applications yet</p>
          <p className="empty-subtitle">Check back soon for student requests</p>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((app) => (
            <div key={app._id} className={`application-card status-${app.status}`}>
              <div className="card-header">
                <h2>{app.studentRequestId?.name || "Unknown Student"}</h2>
                <span className={`status-badge status-${app.status}`}>
                  {app.status === "pending" ? "⏳ Waiting" : app.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">📚 Subject:</span>
                  <span className="info-value">{app.studentRequestId?.subject}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">📖 Grade:</span>
                  <span className="info-value">{app.studentRequestId?.class}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">📍 Location:</span>
                  <span className="info-value">{app.studentRequestId?.locality}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">⏰ Preferred Time:</span>
                  <span className="info-value">{app.studentRequestId?.time || "Flexible"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplications