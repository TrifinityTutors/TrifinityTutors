import { Link } from "react-router-dom"

function Navbar() {
  return (
    <div className="bg-white shadow px-8 py-4 flex justify-between items-center">

      {/* Logo */}
      <h1 className="text-xl font-bold text-blue-600">
        Trifinity Tutors
      </h1>

      {/* Links */}
      <div className="space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>

        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
          Dashboard
        </Link>

        <Link to="/my-applications" className="text-gray-700 hover:text-blue-600">
          Applications
        </Link>
      </div>

    </div>
  )
}

export default Navbar