import { Link, useNavigate } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("tutor")
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          Trifinity Tutors
        </Link>

        <div className="navbar-menu">
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>

              <Link to="/my-applications" className="nav-link">
                My Applications
              </Link>

              <button onClick={handleLogout} className="logout-link">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>

              <Link to="/student-register" className="nav-link">
                Student
              </Link>

              <Link to="/tutor-login" className="nav-link">
                Tutor
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar