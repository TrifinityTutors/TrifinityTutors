import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="text-center py-20">

      {/* HERO TITLE */}
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        Find the Perfect Home Tutor
      </h1>

      {/* SUBTITLE */}
      <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
        Connect with experienced tutors near you and boost your learning experience.
      </p>

      {/* BUTTONS */}
      <div className="flex justify-center gap-6">

        <Link
          to="/student-register"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow"
        >
          Register as Student
        </Link>

        <Link
          to="/tutor-register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow"
        >
          Register as Tutor
        </Link>

      </div>

      {/* FEATURES SECTION */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 px-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-2">Verified Tutors</h3>
          <p className="text-gray-600">
            Learn from experienced and verified teachers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-2">Flexible Learning</h3>
          <p className="text-gray-600">
            Choose your schedule and preferred learning style.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-2">Affordable Pricing</h3>
          <p className="text-gray-600">
            Find tutors that fit your budget.
          </p>
        </div>

      </div>

    </div>
  )
}

export default Home