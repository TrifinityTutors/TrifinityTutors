import { useEffect, useState } from "react"
import axios from "axios"

function MyApplications() {

  const [applications, setApplications] = useState([])

  const tutor = JSON.parse(localStorage.getItem("tutor"))

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tutor/${tutor._id}`
      )
      setApplications(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5">My Applications</h1>

      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app._id} className="border p-5 mb-3 rounded">

            <h2 className="text-lg font-semibold">
              {app.studentRequestId?.subject}
            </h2>

            <p>Name: {app.studentRequestId?.name}</p>
<p>Class: {app.studentRequestId?.class}</p>
<p>Subject: {app.studentRequestId?.subject}</p>
<p>Locality: {app.studentRequestId?.locality}</p>
<p>Time: {app.studentRequestId?.time}</p>

            <p className="mt-2">
              Status:
              <span className={
                app.status === "accepted"
                  ? "text-green-500"
                  : app.status === "rejected"
                  ? "text-red-500"
                  : "text-yellow-500"
              }>
                {" "}{app.status}
              </span>
            </p>

          </div>
        ))
      )}
    </div>
  )
}

export default MyApplications