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
    <div className="profile-container">
      {/* Messages */}
      {successMessage && (
        <div className="message success-message">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="message error-message">
          ❌ {error}
        </div>
      )}

      <div className="profile-wrapper">
        
        {/* Professional Header Card */}
        <div className="profile-header-card">
          <div className="header-overlay"></div>
          
          <div className="profile-header-content">
            <div className="profile-left">
              <div className="profile-photo">
                {tutor?.photo ? (
                  <img src={tutor.photo} alt={tutor.name} />
                ) : (
                  <div className="photo-placeholder">👨‍🏫</div>
                )}
                <div className="verification-badge-corner">
                  {getVerificationBadge()}
                </div>
              </div>
            </div>

            <div className="profile-right">
              <h1 className="profile-name">{tutor?.name || "Your Name"}</h1>
              <p className="profile-email">📧 {tutor?.email}</p>
              
              <div className="profile-quick-info">
                <div className="quick-info-item">
                  <span className="quick-label">📚 Subject</span>
                  <span className="quick-value">{tutor?.subject || "Not specified"}</span>
                </div>
                <div className="quick-info-item">
                  <span className="quick-label">📞 Phone</span>
                  <span className="quick-value">{tutor?.phone || "Not specified"}</span>
                </div>
                <div className="quick-info-item">
                  <span className="quick-label">📍 Location</span>
                  <span className="quick-value">{tutor?.locality || "Not specified"}</span>
                </div>
                <div className="quick-info-item">
                  <span className="quick-label">⭐ Experience</span>
                  <span className="quick-value">{tutor?.experience || 0} years</span>
                </div>
              </div>

              <div className="profile-rate">
                <span className="rate-label">💰 Hourly Rate:</span>
                <span className="rate-value">₹{tutor?.hourlyRate || 0}</span>
              </div>

              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CV Management Section */}
        <div className="section-card cv-card">
          <div className="section-header">
            <h2>📄 CV Management</h2>
            <span className="section-icon">📎</span>
          </div>

          <div className="cv-content">
            {tutor?.cvFile ? (
              <div className="cv-status-success">
                <div className="cv-success-icon">✓</div>
                <div className="cv-info">
                  <p className="cv-file-name">{tutor.cvFileName}</p>
                  <p className="cv-date">Uploaded: {new Date(tutor.cvUploadedAt).toLocaleDateString()}</p>
                </div>
                <button className="btn-download" onClick={handleDownloadCV}>
                  📥 Download
                </button>
              </div>
            ) : (
              <div className="cv-status-empty">
                <p className="empty-icon">📋</p>
                <p className="empty-text">No CV uploaded yet</p>
              </div>
            )}

            <div className="cv-upload-section">
              <div className="upload-box">
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleCVFileChange}
                  className="file-input"
                />
                <label htmlFor="cv-file" className="file-label">
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">
                    {cvFile ? cvFile.name : "Click to upload or drag CV (PDF, DOC, DOCX, JPG, PNG - Max 5MB)"}
                  </span>
                </label>
              </div>
              
              <button
                onClick={handleUploadCV}
                disabled={!cvFile || uploading}
                className="btn-upload"
              >
                {uploading ? "⏳ Uploading..." : "📤 Upload CV"}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="section-card details-card">
          <div className="section-header">
            <h2>👤 Profile Information</h2>
            <span className="section-icon">ℹ️</span>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="subject">Subject Teaching *</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, English"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="experience">Years of Experience *</label>
                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="locality">City/Locality *</label>
                  <input
                    id="locality"
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Enter your city/locality"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
                  <input
                    id="hourlyRate"
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="Enter your hourly rate"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">About You</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell students about yourself, your teaching style, and experience..."
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="qualifications">Qualifications & Certifications</label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="List your educational qualifications, degrees, and certifications..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="teachingMethodology">Teaching Methodology</label>
                <textarea
                  id="teachingMethodology"
                  name="teachingMethodology"
                  value={formData.teachingMethodology}
                  onChange={handleInputChange}
                  placeholder="Describe your teaching approach, methods, and techniques..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button onClick={handleSaveProfile} className="btn-save">
                  ✅ Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-cancel">
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="display-group">
                <div className="display-item">
                  <span className="item-label">Full Name</span>
                  <span className="item-value">{tutor?.name || "Not specified"}</span>
                </div>
                <div className="display-item">
                  <span className="item-label">Phone</span>
                  <span className="item-value">{tutor?.phone || "Not specified"}</span>
                </div>
              </div>

              <div className="display-group">
                <div className="display-item">
                  <span className="item-label">Subject Teaching</span>
                  <span className="item-value">{tutor?.subject || "Not specified"}</span>
                </div>
                <div className="display-item">
                  <span className="item-label">Experience</span>
                  <span className="item-value">{tutor?.experience || 0} years</span>
                </div>
              </div>

              <div className="display-group">
                <div className="display-item">
                  <span className="item-label">Location</span>
                  <span className="item-value">{tutor?.locality || "Not specified"}</span>
                </div>
                <div className="display-item">
                  <span className="item-label">Hourly Rate</span>
                  <span className="item-value">₹{tutor?.hourlyRate || 0}</span>
                </div>
              </div>

              {tutor?.bio && (
                <div className="display-full-item">
                  <span className="item-label">About Me</span>
                  <span className="item-value">{tutor.bio}</span>
                </div>
              )}

              {tutor?.qualifications && (
                <div className="display-full-item">
                  <span className="item-label">Qualifications & Certifications</span>
                  <span className="item-value">{tutor.qualifications}</span>
                </div>
              )}

              {tutor?.teachingMethodology && (
                <div className="display-full-item">
                  <span className="item-label">Teaching Methodology</span>
                  <span className="item-value">{tutor.teachingMethodology}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification Section */}
        <div className="section-card verification-card">
          <div className="section-header">
            <h2>🛡️ Verification Status</h2>
            <span className="section-icon">✓</span>
          </div>

          <div className="verification-content">
            <div className="verification-status">
              <p className="status-label">Current Status:</p>
              <div className="status-badge-large">{getVerificationBadge()}</div>
            </div>

            {tutor?.verificationStatus === "pending" && (
              <div className="verification-info pending-info">
                <p className="info-icon">⏳</p>
                <p className="info-text">Your verification is under review by our admin team. Please wait for approval.</p>
              </div>
            )}

            {tutor?.verificationStatus === "rejected" && (
              <div className="verification-info rejected-info">
                <p className="info-icon">❌</p>
                <div>
                  <p className="info-text">Your verification was rejected.</p>
                  {tutor?.verificationNotes && (
                    <p className="rejection-notes">📝 Reason: {tutor.verificationNotes}</p>
                  )}
                </div>
              </div>
            )}

            {tutor?.verificationStatus === "verified" && (
              <div className="verification-info verified-info">
                <p className="info-icon">🎉</p>
                <div>
                  <p className="info-text">🎉 Congratulations! You are a verified tutor!</p>
                  <p className="verified-date">Verified on: {new Date(tutor.verifiedAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {tutor?.verificationStatus !== "verified" && tutor?.cvFile && (
              <button onClick={handleRequestVerification} className="btn-verify">
                ✅ Request Verification
              </button>
            )}

            {!tutor?.cvFile && (
              <div className="verification-info info">
                <p className="info-icon">📄</p>
                <p className="info-text">Upload your CV first to request verification</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorProfile
