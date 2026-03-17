import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">

      <h1 className="text-4xl font-bold mb-4">
        Trifinity Tutors
      </h1>

      <p className="text-gray-600 mb-8">
        Find the best home tutors in your locality
      </p>

      <div className="flex gap-4">

        <Link to="/student-register">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            Register as Student
          </button>
        </Link>

        <Link to="/tutor-register">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">
            Register as Tutor
          </button>
        </Link>

      </div>

    </div>
  )
}

export default Home