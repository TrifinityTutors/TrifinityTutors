import { useState } from "react"

function StudentCard({ data }) {

  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    try {
      const tutor = JSON.parse(localStorage.getItem("tutor"))

      const response = await fetch("http://localhost:5000/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tutorId: tutor._id,   // ✅ FIXED
          studentRequestId: data._id
        })
      })

      const result = await response.json()

      alert(result.message)

      if (result.message === "Application submitted") {
        setApplied(true)
      }

    } catch (error) {
      console.error("Apply Error:", error)
      alert("Error submitting application")
    }
  }

  return (
    <div className="bg-white shadow-md p-5 rounded-lg border">

      <h2 className="text-xl font-semibold mb-2">
        {data.name}
      </h2>

      <p className="text-gray-600">
        Class: {data.class}
      </p>

      <p className="text-gray-600">
        Subject: {data.subject}
      </p>

      <p className="text-gray-600">
        Locality: {data.locality}
      </p>

      <p className="text-gray-600 mb-4">
        Time: {data.time || "Not specified"}
      </p>

      <button
        onClick={handleApply}
        disabled={applied}
        className={`px-4 py-2 rounded text-white ${
          applied
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {applied ? "Applied" : "Apply"}
      </button>

    </div>
  )
}

export default StudentCard