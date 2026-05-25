import { useState, useEffect } from "react"
import axios from "axios"
import "./TutorProfile.css"

function TutorProfile() {
  const [tutor, setTutor] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    locality: "",
    experience: "",
    phone: "",
    bio: "",
    qualifications: "",
    teachingMethodology: "",
    hourlyRate: ""
  })

  // Fetch tutor profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const tutorData = JSON.parse(localStorage.getItem("tutor"))
      if (!tutorData || !tutorData._id) {
        setError("Please login to view profile")
        setLoading(false)
        return
      }

      const response = await axios.get(
        `http://localhost:5000/api/tutors/profile/${tutorData._id}`
      )

      setTutor(response.data)
      setFormData({
        name: response.data.name || "",
        subject: response.data.subject || "",
        locality: response.data.locality || "",
        experience: response.data.experience || "",
        phone: response.data.phone || "",
        bio: response.data.bio || "",
        qualifications: response.data.qualifications || "",
        teachingMethodology: response.data.teachingMethodology || "",
        hourlyRate: response.data.hourlyRate || ""
      })
      setError(null)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const tutorData = JSON.parse(localStorage.getItem("tutor"))
      const response = await axios.put(
        `http://localhost:5000/api/tutors/profile/${tutorData._id}`,
        formData
      )

      setTutor(response.data.tutor)
      setSuccessMessage("✅ Profile updated successfully!")
      setIsEditing(false)

      // Update localStorage
      localStorage.setItem("tutor", JSON.stringify(response.data.tutor))

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "Failed to update profile")
    }
  }

  const handleCVFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCvFile(file)
    }
  }

  const handleUploadCV = async () => {
    if (!cvFile) {
      setError("Please select a file")
      return
    }

    try {
      setUploading(true)
      const tutorData = JSON.parse(localStorage.getItem("tutor"))
      const formDataWithFile = new FormData()
      formDataWithFile.append("cv", cvFile)

      console.log("📤 Starting CV upload for tutor:", tutorData._id)
      console.log("📄 File details:", { name: cvFile.name, size: cvFile.size, type: cvFile.type })

      const response = await axios.post(
        `http://localhost:5000/api/tutors/upload-cv/${tutorData._id}`,
        formDataWithFile,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      console.log("✅ CV upload response:", response.data)
      setSuccessMessage("✅ CV uploaded successfully!")
      setCvFile(null)
      
      // Clear the file input
      const fileInput = document.getElementById("cv-file")
      if (fileInput) fileInput.value = ""
      
      fetchProfile() // Refresh profile to show updated CV info
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("❌ Error uploading CV:", err)
      setError(err.response?.data?.message || "Failed to upload CV. Make sure file is under 5MB and is PDF/DOC/DOCX/JPG/PNG")
      setTimeout(() => setError(null), 4000)
    } finally {
      setUploading(false)
    }
  }

  const handleRequestVerification = async () => {
    try {
      if (!tutor?.cvFile) {
        setError("Please upload your CV before requesting verification")
        return
      }

      const tutorData = JSON.parse(localStorage.getItem("tutor"))
      const response = await axios.post(
        `http://localhost:5000/api/tutors/request-verification/${tutorData._id}`,
        {
          bio: formData.bio,
          qualifications: formData.qualifications,
          teachingMethodology: formData.teachingMethodology
        }
      )

      setSuccessMessage("✅ " + response.data.message)
      fetchProfile()
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      console.error("Error requesting verification:", err)
      setError(err.response?.data?.message || "Failed to request verification")
    }
  }

  const handleDownloadCV = () => {
    if (tutor?.cvFile) {
      const tutorData = JSON.parse(localStorage.getItem("tutor"))
      window.open(
        `http://localhost:5000/api/tutors/download-cv/${tutorData._id}`,
        "_blank"
      )
    }
  }

  const getVerificationBadge = () => {
    switch (tutor?.verificationStatus) {
      case "verified":
        return <span className="badge badge-verified">✓ Verified</span>
      case "pending":
        return <span className="badge badge-pending">⏳ Pending Review</span>
      case "rejected":
        return <span className="badge badge-rejected">✗ Rejected</span>
      default:
        return <span className="badge badge-unverified">⭕ Unverified</span>
    }
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="profile-container bg-gray-50 min-h-screen">
      {/* Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 max-w-md bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top border-l-4 border-green-300 z-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 max-w-md bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top border-l-4 border-red-300 z-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="profile-wrapper max-w-6xl mx-auto p-6">
        
        {/* Professional Header Card */}
        <div className="profile-header-card bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="profile-left">
              <div className="profile-photo w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-white relative">
                {tutor?.photo ? (
                  <img src={tutor.photo} alt={tutor.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="photo-placeholder">👨‍🏫</div>
                )}
                <div className="verification-badge-corner absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                  {getVerificationBadge()}
                </div>
              </div>
            </div>

            <div className="profile-right flex-1">
              <h1 className="profile-name text-4xl font-bold mb-2">{tutor?.name || "Your Name"}</h1>
              <p className="profile-email text-blue-100 mb-4">📧 {tutor?.email}</p>
              
              <div className="profile-quick-info grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "📚 Subject", value: tutor?.subject || "Not specified" },
                  { label: "📞 Phone", value: tutor?.phone || "Not specified" },
                  { label: "📍 Location", value: tutor?.locality || "Not specified" },
                  { label: "⭐ Experience", value: (tutor?.experience || 0) + " years" }
                ].map((info, idx) => (
                  <div key={idx} className="quick-info-item bg-white/20 rounded-lg p-3 backdrop-blur">
                    <span className="quick-label text-blue-100 text-xs font-medium block">{info.label}</span>
                    <span className="quick-value text-white font-bold mt-1 block">{info.value}</span>
                  </div>
                ))}
              </div>

              <div className="profile-rate mt-6 flex items-center gap-4">
                <span className="rate-label text-blue-100 text-lg">💰 Hourly Rate:</span>
                <span className="rate-value text-3xl font-bold">₹{tutor?.hourlyRate || 0}</span>
              </div>

              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-edit-profile mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CV Management Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📄 CV Management</h2>
            <span className="text-3xl">📎</span>
          </div>

          <div className="cv-content space-y-6">
            {tutor?.cvFile ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">✓</div>
                  <div>
                    <p className="font-bold text-gray-900">{tutor.cvFileName}</p>
                    <p className="text-sm text-gray-600">Uploaded: {new Date(tutor.cvUploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors" onClick={handleDownloadCV}>
                  📥 Download
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-bold text-gray-900">No CV uploaded yet</p>
                <p className="text-gray-600 text-sm mt-1">Upload your CV to start receiving student requests</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer bg-blue-50/30">
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleCVFileChange}
                  className="hidden"
                />
                <label htmlFor="cv-file" className="cursor-pointer flex flex-col items-center justify-center">
                  <span className="text-4xl mb-3">📤</span>
                  <span className="font-semibold text-gray-900">
                    {cvFile ? cvFile.name : "Click to upload or drag CV here"}
                  </span>
                  <span className="text-xs text-gray-600 mt-2">(PDF, DOC, DOCX, JPG, PNG - Max 5MB)</span>
                </label>
              </div>
              
              <button
                onClick={handleUploadCV}
                disabled={!cvFile || uploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {uploading ? "⏳ Uploading..." : "📤 Upload CV"}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">👤 Profile Information</h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="edit-form space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">Phone *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">Subject Teaching *</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, English"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-bold text-gray-900 mb-2">Years of Experience *</label>
                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="locality" className="block text-sm font-bold text-gray-900 mb-2">City/Locality *</label>
                  <input
                    id="locality"
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Enter your city/locality"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-bold text-gray-900 mb-2">Hourly Rate (₹)</label>
                  <input
                    id="hourlyRate"
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="Enter your hourly rate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-bold text-gray-900 mb-2">About You</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell students about yourself, your teaching style, and experience..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label htmlFor="qualifications" className="block text-sm font-bold text-gray-900 mb-2">Qualifications & Certifications</label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="List your educational qualifications, degrees, and certifications..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label htmlFor="teachingMethodology" className="block text-sm font-bold text-gray-900 mb-2">Teaching Methodology</label>
                <textarea
                  id="teachingMethodology"
                  name="teachingMethodology"
                  value={formData.teachingMethodology}
                  onChange={handleInputChange}
                  placeholder="Describe your teaching approach, methods, and techniques..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleSaveProfile} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  ✅ Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-all duration-300">
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: tutor?.name || "Not specified" },
                  { label: "Phone", value: tutor?.phone || "Not specified" },
                  { label: "Subject Teaching", value: tutor?.subject || "Not specified" },
                  { label: "Experience", value: (tutor?.experience || 0) + " years" },
                  { label: "Location", value: tutor?.locality || "Not specified" },
                  { label: "Hourly Rate", value: "₹" + (tutor?.hourlyRate || 0) }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{item.value}</p>
                  </div>
                ))}
              </div>

              {tutor?.bio && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-6">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">📖 About Me</p>
                  <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                </div>
              )}

              {tutor?.qualifications && (
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">🎓 Qualifications</p>
                  <p className="text-gray-700 leading-relaxed">{tutor.qualifications}</p>
                </div>
              )}

              {tutor?.teachingMethodology && (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <p className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2">🎯 Teaching Methodology</p>
                  <p className="text-gray-700 leading-relaxed">{tutor.teachingMethodology}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🛡️ Verification Status</h2>
            <span className="text-3xl">✓</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <span className="text-lg font-bold text-gray-900">Current Status:</span>
              <div>{getVerificationBadge()}</div>
            </div>

            {tutor?.verificationStatus === "pending" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex gap-4">
                  <span className="text-3xl">⏳</span>
                  <div>
                    <p className="font-bold text-gray-900">Verification Pending</p>
                    <p className="text-gray-600 text-sm mt-1">Your verification is under review by our admin team. Please wait for approval.</p>
                  </div>
                </div>
              </div>
            )}

            {tutor?.verificationStatus === "rejected" && (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex gap-4">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-bold text-gray-900">Verification Rejected</p>
                    {tutor?.verificationNotes && (
                      <p className="text-gray-600 text-sm mt-1">📝 Reason: {tutor.verificationNotes}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tutor?.verificationStatus === "verified" && (
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
                <div className="flex gap-4">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <p className="font-bold text-gray-900">Congratulations!</p>
                    <p className="text-gray-600 text-sm mt-1">You are a verified tutor! Verified on: {new Date(tutor.verifiedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {tutor?.verificationStatus !== "verified" && tutor?.cvFile && (
              <button onClick={handleRequestVerification} className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                ✅ Request Verification
              </button>
            )}

            {!tutor?.cvFile && (
              <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-lg">
                <div className="flex gap-4">
                  <span className="text-3xl">📄</span>
                  <p className="text-gray-600">Upload your CV first to request verification</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorProfile
