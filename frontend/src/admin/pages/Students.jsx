import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AdminStudents.css"

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students/with-applications", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    await fetch(`http://localhost:5000/api/students/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    fetchStudents();
  };

  const addStudent = async () => {
    await fetch("http://localhost:5000/api/students/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "New Student",
        class: "9th",
        subject: "Science",
        locality: "Main Street",
        board: "CBSE",
        phoneNumber: "9999999999",
        exactAddress: "123 Main Street, City"
      })
    });

    fetchStudents();
  };

  const approveTutor = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Tutor approved successfully!");
        fetchStudents();
      } else {
        alert("Error: " + (data.msg || data.message || "Failed to approve"));
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Error approving tutor: " + err.message);
    }
  };

  const rejectTutor = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/reject/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("❌ Tutor rejected successfully!");
        fetchStudents();
      } else {
        alert("Error: " + (data.msg || data.message || "Failed to reject"));
      }
    } catch (err) {
      console.error("Reject error:", err);
      alert("Error rejecting tutor: " + err.message);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Student Management</h1>
            <p className="subtitle">Manage students and their tutor applications</p>
          </div>
          <button onClick={addStudent} className="btn-add">+ Add Student</button>
        </div>

        {loading ? (
          <div className="loading">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p>No students found</p>
          </div>
        ) : (
          <div className="students-list">
            {students.map((s) => (
              <div key={s._id} className="student-card">
                <div className="student-header">
                  <div>
                    <h3>{s.name}</h3>
                    <div className="student-meta">
                      <span className="badge">📚 {s.class}</span>
                      <span className="badge">🎓 {s.subject}</span>
                      <span className="badge">📋 {s.board || "N/A"}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteStudent(s._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>

                {/* ADMIN ONLY: SENSITIVE INFO */}
                <div className="admin-sensitive-info">
                  <p><strong>📱 Phone:</strong> {s.phoneNumber || "N/A"}</p>
                  <p><strong>📍 Exact Address:</strong> {s.exactAddress || "N/A"}</p>
                  <p><strong>🏘️ Locality:</strong> {s.locality || "N/A"}</p>
                </div>

                {/* SHOW SELECTED TUTOR */}
                {s.applications &&
                  s.applications
                    .filter((app) => app.status === "accepted")
                    .map((app) => (
                      <div key={app._id} className="selected-tutor">
                        ✅ Selected Tutor: <strong>{app.tutorName}</strong>
                      </div>
                    ))}

                {/* APPLICATIONS */}
                <div className="applications-section">
                  <h4>Applied Tutors ({s.applications?.length || 0})</h4>

                  {s.applications && s.applications.length === 0 ? (
                    <p className="no-apps">No tutor applications yet</p>
                  ) : (
                    <div className="applications-list">
                      {s.applications &&
                        s.applications.map((app) => (
                          <div key={app._id} className={`application-item status-${app.status}`}>
                            <div className="app-info">
                              <p className="tutor-name">👨‍🏫 {app.tutorName || "Unknown Tutor"}</p>
                              <p className="tutor-email" style={{fontSize: '12px', color: '#666', margin: '4px 0 0 0'}}>
                                {app.tutorEmail || ""}
                              </p>
                              <span className={`status-badge status-${app.status}`}>
                                {app.status?.toUpperCase() || "PENDING"}
                              </span>
                            </div>

                            {app.status === "pending" && (
                              <div className="app-actions">
                                <button
                                  onClick={() => approveTutor(app._id)}
                                  className="btn-approve"
                                >
                                  ✅ Approve
                                </button>

                                <button
                                  onClick={() => rejectTutor(app._id)}
                                  className="btn-reject"
                                >
                                  ❌ Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}