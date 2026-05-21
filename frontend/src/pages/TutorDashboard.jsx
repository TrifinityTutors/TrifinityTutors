import { useEffect, useState } from "react"
import StudentCard from "../components/StudentCard"
import "./TutorDashboard.css"

function TutorDashboard() {

  const [studentRequests, setStudentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log("Fetching student requests...")
        const response = await fetch("http://localhost:5000/api/students/studentrequests")
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Student requests fetched:", data)
        
        if (Array.isArray(data)) {
          setStudentRequests(data)
        } else {
          console.warn("Response is not an array:", data)
          setStudentRequests([])
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching student requests:", err)
        setError(err.message)
        setStudentRequests([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Available Student Requests</h1>
        <p className="subtitle">Browse and apply to student tutoring requests</p>
      </div>

      {loading ? (
        <div className="loading">Loading requests...</div>
      ) : error ? (
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p>Error loading requests</p>
          <p className="error-subtitle">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : studentRequests.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📚</p>
          <p>No student requests available</p>
          <p className="empty-subtitle">Check back later for new requests</p>
        </div>
      ) : (
        <div className="requests-grid">
          {studentRequests.map((req) => (
            <StudentCard key={req._id} data={req} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TutorDashboard