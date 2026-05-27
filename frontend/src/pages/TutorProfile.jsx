import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "@/lib/auth"
import { DashLayout } from "@/components/dash/DashLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Home, User as UserIcon, Settings, Calendar, MessageSquare, Bell, Star, BadgeCheck, Upload, Download, CheckCircle2, AlertCircle } from "lucide-react"
import "./TutorProfile.css"

function TutorProfile() {
  const location = useLocation()
  const navigate = useNavigate()
  const { token, user: authUser, setSession } = useAuth()
  const [tutor, setTutor] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [profilePhotoFile, setProfilePhotoFile] = useState(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("")
  const [documentFiles, setDocumentFiles] = useState([])
  const profilePhotoInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    subjects: "",
    locality: "",
    experience: "",
    phone: "",
    bio: "",
    qualifications: "",
    education: "",
    teachingMethodology: "",
    hourlyRate: "",
    availability: ""
  })

  // Fetch tutor profile on mount
  useEffect(() => {
    if (token) {
      fetchProfile()
    } else {
      setError("Please login to view profile")
      setLoading(false)
    }
  }, [token])

  // Handle navigation state for opening photo upload or edit
  useEffect(() => {
    const state = location?.state || {}
    if (state?.openPhotoUpload) {
      setIsEditing(true)
      setTimeout(() => {
        const input = document.getElementById("profilePhotoHidden")
        if (input) input.click()
      }, 100)
    } else if (state?.scrollTo === "edit") {
      setIsEditing(true)
      setTimeout(() => {
        document.querySelector(".edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 300)
    }
  }, [location?.state])

  const fetchProfile = async () => {
    try {
      const tutorData = authUser || JSON.parse(localStorage.getItem("tutor"))
      if (!tutorData || !tutorData._id) {
        setError("Please login to view profile")
        setLoading(false)
        return
      }

      const response = await axios.get(
        `http://localhost:5000/api/tutors/profile/${tutorData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const profile = response.data
      setTutor(profile)
      setFormData({
        name: profile.name || "",
        subject: profile.subject || "",
        subjects: Array.isArray(profile.subjects) ? profile.subjects.join(", ") : (profile.subjects || ""),
        locality: profile.locality || "",
        experience: profile.experience || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        qualifications: profile.qualifications || "",
        education: profile.education || "",
        teachingMethodology: profile.teachingMethodology || "",
        hourlyRate: profile.hourlyRate || "",
        availability: Array.isArray(profile.availability) ? profile.availability.join(", ") : (profile.availability || "")
      })

      setSession(token, { ...authUser, ...profile, role: "tutor", profileComplete: true })
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

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePhotoFile(file)
      setProfilePhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleDocumentFilesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) {
      setDocumentFiles(files)
    }
  }

  const handleProfilePhotoClick = () => {
    // Enter edit mode and trigger the always-present hidden file input via ref
    setIsEditing(true)
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.click()
    } else {
      const input = document.getElementById("profilePhotoHidden")
      if (input) input.click()
    }
  }

  const handleSaveProfile = async () => {
    try {
      const tutorData = authUser || JSON.parse(localStorage.getItem("tutor"))
      const hasFiles = profilePhotoFile || documentFiles.length > 0
      let response

      if (hasFiles) {
        const submitForm = new FormData()
        submitForm.append("name", formData.name)
        submitForm.append("subject", formData.subject)
        submitForm.append("subjects", formData.subjects)
        submitForm.append("locality", formData.locality)
        submitForm.append("experience", formData.experience)
        submitForm.append("phone", formData.phone)
        submitForm.append("bio", formData.bio)
        submitForm.append("qualifications", formData.qualifications)
        submitForm.append("education", formData.education)
        submitForm.append("teachingMethodology", formData.teachingMethodology)
        submitForm.append("hourlyRate", formData.hourlyRate)
        submitForm.append("availability", formData.availability)

        if (profilePhotoFile) {
          submitForm.append("profilePhoto", profilePhotoFile)
        }

        documentFiles.forEach((doc, index) => {
          submitForm.append("documents", doc)
        })

        response = await axios.put(
          `http://localhost:5000/api/tutors/profile/${tutorData._id}`,
          submitForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
      } else {
        response = await axios.put(
          `http://localhost:5000/api/tutors/profile/${tutorData._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      }

      setTutor(response.data.tutor)
      setSuccessMessage("✅ Profile updated successfully!")
      setIsEditing(false)
      setProfilePhotoFile(null)
      setDocumentFiles([])
      setProfilePhotoPreview("")

      setSession(token, { ...authUser, ...response.data.tutor, role: "tutor", profileComplete: true })

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

      const response = await axios.post(
        `http://localhost:5000/api/tutors/upload-cv/${tutorData._id}`,
        formDataWithFile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      )

      setSuccessMessage("✅ CV uploaded successfully!")
      setCvFile(null)
      
      // Clear the file input
      const fileInput = document.getElementById("cv-file")
      if (fileInput) fileInput.value = ""
      
      fetchProfile() // Refresh profile to show updated CV info
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Error uploading CV:", err)
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

      const tutorData = authUser || JSON.parse(localStorage.getItem("tutor"))
      const response = await axios.post(
        `http://localhost:5000/api/tutors/request-verification/${tutorData._id}`,
        {
          bio: formData.bio,
          qualifications: formData.qualifications,
          teachingMethodology: formData.teachingMethodology
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      const tutorData = authUser || JSON.parse(localStorage.getItem("tutor"))
      window.open(
        `http://localhost:5000/api/tutors/download-cv/${tutorData._id}`,
        "_blank"
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const items = [
    { to: "/tutor-dashboard", label: "Overview", icon: Home },
    { to: "/tutor-profile", label: "Profile", icon: UserIcon },
    { to: "/tutor-settings", label: "Settings", icon: Settings },
    { to: "/tutor-sessions", label: "Sessions", icon: Calendar },
    { to: "/tutor-messages", label: "Messages", icon: MessageSquare },
    { to: "/tutor-notifications", label: "Notifications", icon: Bell },
  ]

  const tutorName = tutor?.name || "Tutor"
  const tutorEmail = tutor?.email || ""
  const tutorImage = tutor?.profilePhoto || tutor?.photo || ""
  const tutorRating = tutor?.rating || 4.9
  const tutorSessions = tutor?.sessions || 0

  return (
    <DashLayout items={items} title="Account">
      {/* Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 max-w-md bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top border-l-4 border-green-300 z-50">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 max-w-md bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top border-l-4 border-red-300 z-50">
          {error}
        </div>
      )}

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="text-muted-foreground">Manage how you appear across Trifinity.</p>

        {/* Profile Header Card */}
        <Card className="mt-6 rounded-2xl p-6 border-border/60 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                onClick={handleProfilePhotoClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleProfilePhotoClick() }}
                className="relative h-20 w-20 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all cursor-pointer flex-shrink-0 group"
                aria-label="Edit profile photo"
              >
                {tutorImage ? (
                  <img src={tutorImage} alt={tutorName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl">
                    {tutorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">✏️ Edit</span>
                </div>
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{tutorName}</h2>
                <BadgeCheck className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">{tutorEmail} · Tutor</p>
              <div className="flex items-center gap-1 text-sm mt-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{tutorRating} average</span>
                <span className="text-muted-foreground">· {tutorSessions} sessions</span>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={profilePhotoInputRef}
            id="profilePhotoHidden"
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            className="hidden"
          />
        </Card>

        {/* Edit Profile Card */}
        <Card className="mt-6 rounded-2xl p-6 border-border/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Profile Information</h3>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="rounded-lg"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile() }} className="edit-form space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 rounded-lg h-10"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={tutorEmail}
                    disabled
                    className="mt-1.5 rounded-lg h-10 bg-muted"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="mt-1.5 rounded-lg h-10"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5 rounded-lg h-10"
                  />
                </div>
                <div>
                  <Label>Subject Teaching</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1.5 rounded-lg h-10"
                  />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="mt-1.5 rounded-lg h-10"
                  />
                </div>
                <div>
                  <Label>Hourly Rate (₹)</Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="mt-1.5 rounded-lg h-10"
                  />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-1.5 rounded-lg"
                  placeholder="Tell students about yourself..."
                />
              </div>

              <div>
                <Label>Qualifications & Certifications</Label>
                <Textarea
                  rows={3}
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="mt-1.5 rounded-lg"
                />
              </div>

              <div>
                <Label>Teaching Methodology</Label>
                <Textarea
                  rows={3}
                  value={formData.teachingMethodology}
                  onChange={(e) => setFormData({ ...formData, teachingMethodology: e.target.value })}
                  className="mt-1.5 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="rounded-lg">
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: tutor?.name || "Not specified" },
                  { label: "Email", value: tutor?.email || "Not specified" },
                  { label: "Location", value: tutor?.locality || "Not specified" },
                  { label: "Phone", value: tutor?.phone || "Not specified" },
                  { label: "Subject", value: tutor?.subject || "Not specified" },
                  { label: "Experience", value: (tutor?.experience || 0) + " years" },
                  { label: "Hourly Rate", value: "₹" + (tutor?.hourlyRate || 0) },
                  { label: "Role", value: "Tutor" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">{item.label}</div>
                    <div className="text-sm font-medium mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              {tutor?.bio && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase mb-2">About You</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tutor.bio}</p>
                </div>
              )}

              {tutor?.qualifications && (
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-900">
                  <div className="text-xs font-semibold text-purple-900 dark:text-purple-100 uppercase mb-2">Qualifications</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tutor.qualifications}</p>
                </div>
              )}

              {tutor?.teachingMethodology && (
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-900">
                  <div className="text-xs font-semibold text-green-900 dark:text-green-100 uppercase mb-2">Teaching Methodology</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tutor.teachingMethodology}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* CV Management Card */}
        <Card className="mt-6 rounded-2xl p-6 border-border/60 shadow-sm">
          <h3 className="text-xl font-bold mb-6">CV Management</h3>

          {tutor?.cvFile ? (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">{tutor.cvFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded: {new Date(tutor.cvUploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadCV}
                className="rounded-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-950/30 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center mb-6">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 dark:text-gray-100">No CV uploaded</p>
              <p className="text-xs text-muted-foreground mt-1">Upload your CV to complete your profile</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>Upload CV</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleCVFileChange}
                  className="hidden"
                />
                <label htmlFor="cv-file" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium">
                    {cvFile ? cvFile.name : "Click to upload or drag here"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, JPG, PNG — Max 5MB
                  </span>
                </label>
              </div>
            </div>

            <Button
              onClick={handleUploadCV}
              disabled={!cvFile || uploading}
              className="w-full rounded-lg"
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </Button>
          </div>
        </Card>

        {/* Verification Status Card */}
        <Card className="mt-6 rounded-2xl p-6 border-border/60 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Verification Status</h3>

          <div className={`rounded-lg p-4 mb-6 ${
            tutor?.verificationStatus === "verified"
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
              : tutor?.verificationStatus === "pending"
              ? "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900"
              : tutor?.verificationStatus === "rejected"
              ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
              : "bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-900"
          }`}>
            <p className="text-sm font-semibold">
              {tutor?.verificationStatus === "verified" && "✓ Verified"}
              {tutor?.verificationStatus === "pending" && "⏳ Pending Review"}
              {tutor?.verificationStatus === "rejected" && "✗ Rejected"}
              {!tutor?.verificationStatus && "⭕ Unverified"}
            </p>
          </div>

          {tutor?.verificationStatus !== "verified" && tutor?.cvFile && (
            <Button
              onClick={handleRequestVerification}
              className="w-full rounded-lg"
            >
              Request Verification
            </Button>
          )}

          {!tutor?.cvFile && (
            <p className="text-sm text-muted-foreground">
              Upload your CV first to request verification
            </p>
          )}
        </Card>
      </div>
    </DashLayout>
  )
}

export default TutorProfile
