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
    <div className="applications-container bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="applications-header flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Applications</h1>
            <p className="subtitle text-blue-100">Track your student requests and application status</p>
          </div>
          <button 
            onClick={fetchApplications} 
            disabled={loading}
            className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="error-state bg-red-50 rounded-2xl p-8 text-center border-l-4 border-red-500 shadow-sm">
            <p className="error-icon text-5xl mb-3">⚠️</p>
            <p className="text-lg font-bold text-gray-900">Error loading applications</p>
            <p className="error-subtitle text-gray-600 mt-2">{error}</p>
            <button 
              onClick={fetchApplications}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all duration-300 hover:-translate-y-0.5"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <p className="empty-icon text-6xl mb-4">📭</p>
            <p className="text-2xl font-bold text-gray-900">No applications yet</p>
            <p className="empty-subtitle text-gray-600 mt-2 text-lg">Check back soon for student requests</p>
          </div>
        ) : (
          <div className="applications-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => {
              const statusConfig = {
                pending: { bg: "from-yellow-50 to-amber-50", border: "border-yellow-200", icon: "⏳", badge: "Waiting", badgeBg: "bg-yellow-100 text-yellow-700" },
                approved: { bg: "from-green-50 to-emerald-50", border: "border-green-200", icon: "✅", badge: "Approved", badgeBg: "bg-green-100 text-green-700" },
                rejected: { bg: "from-red-50 to-rose-50", border: "border-red-200", icon: "❌", badge: "Rejected", badgeBg: "bg-red-100 text-red-700" }
              };
              const config = statusConfig[app.status] || statusConfig.pending;
              
              return (
                <div key={app._id} className={`application-card bg-gradient-to-br ${config.bg} border-l-4 ${config.border} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{app.studentRequestId?.name || "Unknown Student"}</h2>
                      <p className="text-sm text-gray-600 mt-1">Student Request</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${config.badgeBg}`}>
                      {config.icon} {config.badge}
                    </span>
                  </div>

                  <div className="space-y-3 my-6">
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <span className="text-lg">📚</span>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Subject</p>
                        <p className="font-bold text-gray-900">{app.studentRequestId?.subject || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <span className="text-lg">📖</span>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Grade</p>
                        <p className="font-bold text-gray-900">{app.studentRequestId?.class || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <span className="text-lg">📍</span>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Location</p>
                        <p className="font-bold text-gray-900">{app.studentRequestId?.location || "Online"}</p>
                      </div>
                    </div>
                  </div>

                  {app.studentRequestId?.requirements && (
                    <div className="bg-white/50 rounded-lg p-4 mb-6">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Requirements</p>
                      <p className="text-sm text-gray-700">{app.studentRequestId.requirements}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 border border-gray-300">
                      View Details
                    </button>
                    {app.status === "pending" && (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications