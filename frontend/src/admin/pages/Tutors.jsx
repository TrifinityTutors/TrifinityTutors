import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Tutors() {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    const res = await fetch("http://localhost:5000/api/tutors", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    const data = await res.json();
    setTutors(data);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", width: "100%" }}>
        <h1>All Tutors</h1>

        {tutors.map((t) => (
          <div
            key={t._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              margin: "10px 0",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <h3>👨‍🏫 {t.name}</h3>

            <p><b>Email:</b> {t.email}</p>

            <p>
              <b>Subject:</b>{" "}
              {t.subject && t.subject !== "" ? t.subject : "Not provided"}
            </p>

            <p>
              <b>Experience:</b>{" "}
              {t.experience ? `${t.experience} years` : "Not provided"}
            </p>

            <p>
              <b>Phone:</b>{" "}
              {t.phone && t.phone !== "" ? t.phone : "Not provided"}
            </p>

            <p>
              <b>Location:</b>{" "}
              {t.locality && t.locality !== "" ? t.locality : "Not provided"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}