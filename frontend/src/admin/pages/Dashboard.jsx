import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [tutorCount, setTutorCount] = useState(0);

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
      setStudentCount(studentData.count);

      const tutorRes = await fetch("http://localhost:5000/api/tutors/count", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      const tutorData = await tutorRes.json();
      setTutorCount(tutorData.count);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px" }}>
        <h1>Admin Dashboard</h1>

        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px"
        }}>
          <div style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px"
          }}>
            <h3>Total Students</h3>
            <p>{studentCount}</p>
          </div>

          <div style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px"
          }}>
            <h3>Total Tutors</h3>
            <p>{tutorCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}