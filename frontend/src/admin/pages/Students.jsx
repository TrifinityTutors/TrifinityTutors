import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🔥 FETCH STUDENTS WITH APPLICATIONS
  const fetchStudents = async () => {
    const res = await fetch("http://localhost:5000/api/students/with-applications", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    const data = await res.json();
    setStudents(data);
  };

  // ❌ DELETE STUDENT
  const deleteStudent = async (id) => {
    await fetch(`http://localhost:5000/api/students/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    fetchStudents();
  };

  // ➕ ADD STUDENT (dummy)
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
        phone: "9999999999"
      })
    });

    fetchStudents();
  };

  // ✅ APPROVE TUTOR
  const approveTutor = async (id) => {
    await fetch(`http://localhost:5000/api/students/approve/${id}`, {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    fetchStudents();
  };

  // ❌ REJECT TUTOR
  const rejectTutor = async (id) => {
    await fetch(`http://localhost:5000/api/students/reject/${id}`, {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    fetchStudents();
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", width: "100%" }}>
        <h1>Students</h1>

        <button onClick={addStudent}>Add Student</button>

        {students.map((s) => (
          <div
            key={s._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              margin: "15px 0",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            {/* STUDENT INFO */}
            <h3>{s.name}</h3>
            <p>Class: {s.class}</p>
            <p>Subject: {s.subject}</p>

            {/* DELETE BUTTON */}
            <button onClick={() => deleteStudent(s._id)}>
              Delete
            </button>

            <hr />

            {/* ✅ SHOW SELECTED TUTOR */}
            {s.applications &&
              s.applications
                .filter((app) => app.status === "accepted")
                .map((app) => (
                  <p
                    key={app._id}
                    style={{
                      color: "green",
                      fontWeight: "bold"
                    }}
                  >
                    ✅ Selected Tutor: {app.tutorName}
                  </p>
                ))}

            {/* APPLICATIONS */}
            <h4>Applied Tutors:</h4>

            {s.applications && s.applications.length === 0 && (
              <p>No applications</p>
            )}

            {s.applications &&
              s.applications.map((app) => (
                <div
                  key={app._id}
                  style={{
                    marginBottom: "10px",
                    padding: "8px",
                    border: "1px solid #eee",
                    borderRadius: "6px"
                  }}
                >
                  <p>
                    👨‍🏫 {app.tutorName} —{" "}
                    <b
                      style={{
                        color:
                          app.status === "accepted"
                            ? "green"
                            : app.status === "rejected"
                            ? "red"
                            : "orange"
                      }}
                    >
                      {app.status}
                    </b>
                  </p>

                  {/* SHOW BUTTONS ONLY IF PENDING */}
                  {app.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveTutor(app._id)}
                        style={{ marginRight: "10px" }}
                      >
                        ✅ Approve
                      </button>

                      <button
                        onClick={() => rejectTutor(app._id)}
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}