import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "./Navbar.css"

function Navbar() {
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("tutor")
    setIsMenuOpen(false)
    navigate("/")
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={handleLinkClick}>
          <span className="logo-icon">🎓</span>
          <span className="logo-text">Trifinity Tutors</span>
        </Link>

        {isMobile && (
          <button
            className={`hamburger ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={handleLinkClick}>
                Dashboard
              </Link>

              <Link to="/my-applications" className="nav-link" onClick={handleLinkClick}>
                My Applications
              </Link>

              <Link to="/tutor-profile" className="nav-link" onClick={handleLinkClick}>
                👤 Profile
              </Link>

              <button onClick={handleLogout} className="logout-link">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={handleLinkClick}>
                Home
              </Link>

              <Link to="/student-register" className="nav-link" onClick={handleLinkClick}>
                Student
              </Link>

              <Link to="/tutor-login" className="nav-link" onClick={handleLinkClick}>
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