import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AdminTutors.css"

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tutors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setTutors(data);
      } else {
        console.error("Error from backend:", data);
        setTutors([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tutors/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Tutor ${status} successfully!`);
        fetchTutors();
      } else {
        alert("Error: " + (data.error || data.message || "Failed to update"));
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating tutor: " + err.message);
    }
  };

  const deleteTutor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tutors/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Tutor deleted successfully!");
        fetchTutors();
      } else {
        alert("Error: " + (data.error || data.message || "Failed to delete"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting tutor: " + err.message);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Tutor Management</h1>
            <p className="subtitle">Review and manage all tutors on the platform</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading tutors...</div>
        ) : tutors.length === 0 ? (
          <div className="empty-state">
            <p>No tutors found</p>
          </div>
        ) : (
          <div className="tutors-list">
            {tutors.map((t) => (
              <div key={t._id} className={`tutor-card status-${t.status}`}>
                <div className="tutor-header">
                  <div className="tutor-name">
                    <h3>👨‍🏫 {t.name}</h3>
                    <span className={`status-badge status-${t.status}`}>
                      {t.status ? t.status.toUpperCase() : "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="tutor-info">
                  <div className="info-row">
                    <span className="label">📧 Email:</span>
                    <span className="value">{t.email}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">🎓 Subject:</span>
                    <span className="value">
                      {t.subject && t.subject !== "" ? t.subject : "Not provided"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">⏱️ Experience:</span>
                    <span className="value">
                      {t.experience ? `${t.experience} years` : "Not provided"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">📞 Phone:</span>
                    <span className="value">
                      {t.phone && t.phone !== "" ? t.phone : "Not provided"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">📍 Location:</span>
                    <span className="value">
                      {t.locality && t.locality !== "" ? t.locality : "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="tutor-actions">
                  <button 
                    onClick={() => deleteTutor(t._id, t.name)}
                    className="btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}