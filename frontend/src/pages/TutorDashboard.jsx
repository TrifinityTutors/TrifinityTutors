import StudentCard from "../components/StudentCard"

function TutorDashboard() {

  const studentRequests = [
    {
      class: "10",
      subject: "Maths",
      locality: "Wakad",
      time: "Evening"
    },
    {
      class: "8",
      subject: "Science",
      locality: "Baner",
      time: "Morning"
    }
  ]

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-8">
        Student Requests
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {studentRequests.map((req, index) => (
          <StudentCard key={index} data={req} />
        ))}

      </div>

    </div>
  )
}

export default TutorDashboard