import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AdminDashboard.css"

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [tutorCount, setTutorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const studentRes = await fetch("http://localhost:5000/api/students/count", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      const studentData = await studentRes.json();
      setStudentCount(studentData.count || 0);

      const tutorRes = await fetch("http://localhost:5000/api/tutors/count", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      const tutorData = await tutorRes.json();
      setTutorCount(tutorData.count || 0);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Welcome back! Here's your platform overview.</p>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon students">👥</div>
              <div className="stat-content">
                <h3>Total Students</h3>
                <p className="stat-number">{studentCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon tutors">👨‍🏫</div>
              <div className="stat-content">
                <h3>Total Tutors</h3>
                <p className="stat-number">{tutorCount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}