import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AdminVerifications.css";

export default function Verifications() {
  const [allTutors, setAllTutors] = useState([]); // All tutors for counts
  const [filteredTutors, setFilteredTutors] = useState([]); // Filtered tutors for display
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [filter, setFilter] = useState("all"); // pending, verified, rejected, all

  useEffect(() => {
    // On component mount, fetch all tutors for counts
    fetchAllTutorsForCounts();
  }, []);

  useEffect(() => {
    // When filter changes, fetch filtered tutors
    fetchAllVerifications();
  }, [filter]);

  const fetchAllTutorsForCounts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tutors/verifications", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      const data = await res.json();
      setAllTutors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllVerifications = async () => {
    setLoading(true);
    try {
      const statusParam = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`http://localhost:5000/api/tutors/verifications${statusParam}`, {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      const data = await res.json();
      setFilteredTutors(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (tutorId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tutors/verify/${tutorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify({
          verificationStatus: status,
          verificationNotes
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Tutor ${status} successfully!`);
        setSelectedTutor(null);
        setVerificationNotes("");
        fetchAllVerifications();
      } else {
        alert("Error: " + (data.message || "Failed to verify"));
      }
    } catch (err) {
      console.error("Verify error:", err);
      alert("Error verifying tutor: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-content">
          <p className="loading">Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <div className="verifications-container">
          <div className="page-header">
            <h1>🛡️ Tutor Verifications</h1>
            <p className="subtitle">Review and verify tutor profiles</p>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              ⏳ Pending ({allTutors.filter(t => t.verificationStatus === "pending").length})
            </button>
            <button
              className={`filter-btn ${filter === "verified" ? "active" : ""}`}
              onClick={() => setFilter("verified")}
            >
              ✓ Verified ({allTutors.filter(t => t.verificationStatus === "verified").length})
            </button>
            <button
              className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              ✗ Rejected ({allTutors.filter(t => t.verificationStatus === "rejected").length})
            </button>
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({allTutors.length})
            </button>
          </div>

          {filteredTutors.length === 0 ? (
            <div className="no-data">
              <p>No tutors to display</p>
            </div>
          ) : (
            <div className="tutors-grid">
              {filteredTutors.map((tutor) => (
                <div key={tutor._id} className="tutor-verification-card">
                  <div className="card-header">
                    <h3>{tutor.name}</h3>
                    <span className={`status-badge status-${tutor.verificationStatus}`}>
                      {tutor.verificationStatus === "pending" && "⏳ Pending"}
                      {tutor.verificationStatus === "verified" && "✓ Verified"}
                      {tutor.verificationStatus === "rejected" && "✗ Rejected"}
                    </span>
                  </div>

                  <div className="card-content">
                    <p><strong>Email:</strong> {tutor.email}</p>
                    <p><strong>Subject:</strong> {tutor.subject}</p>
                    <p><strong>Experience:</strong> {tutor.experience} years</p>
                    <p><strong>Phone:</strong> {tutor.phone}</p>

                    {tutor.qualifications && (
                      <div className="qualifications">
                        <strong>Qualifications:</strong>
                        <p>{tutor.qualifications}</p>
                      </div>
                    )}

                    {tutor.bio && (
                      <div className="bio">
                        <strong>Bio:</strong>
                        <p>{tutor.bio}</p>
                      </div>
                    )}

                    {tutor.cvFile && (
                      <div className="cv-info">
                        <a
                          href={`http://localhost:5000/api/tutors/download-cv/${tutor._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cv-link"
                        >
                          📄 View CV
                        </a>
                      </div>
                    )}

                    <p className="uploaded-date">
                      Uploaded: {new Date(tutor.cvUploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {tutor.verificationStatus === "pending" && (
                    <div className="card-actions">
                      <button
                        className="btn-approve"
                        onClick={() => setSelectedTutor(tutor._id)}
                      >
                        ✓ Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Review Modal */}
          {selectedTutor && (
            <div className="modal-overlay" onClick={() => setSelectedTutor(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Verification Review</h2>
                  <button
                    className="modal-close"
                    onClick={() => setSelectedTutor(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Verification Notes</label>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add notes for rejection or approval..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleVerify(selectedTutor, "verified")}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleVerify(selectedTutor, "rejected")}
                  >
                    ✗ Reject
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setSelectedTutor(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
