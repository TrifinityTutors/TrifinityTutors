import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { ProfileDropdown } from "@/components/ProfileDropdown"
import "./TutorSidebar.css"

function TutorSidebar({ navItems = [] }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()

  const tutorData = user?.role === "tutor" ? user : (() => {
    try {
      return JSON.parse(localStorage.getItem("tutor")) || {};
    } catch {
      return {};
    }
  })()

  const tutorName = tutorData?.name || tutorData?.fullName || "Tutor"
  const tutorImage = tutorData?.profilePhoto || tutorData?.photo || ""

  const handleLogout = () => {
    if (logout) {
      logout()
      return
    }

    localStorage.removeItem("token")
    localStorage.removeItem("tutor")
    navigate("/")
  }

  const defaultMenuItems = [
    { label: "Overview", icon: "📊", to: "/tutor-dashboard" },
    { label: "Schedule", icon: "📅", to: "/tutor-dashboard" },
    { label: "Students", icon: "👥", to: "/tutor-dashboard" },
    { label: "Earnings", icon: "💰", to: "/tutor-dashboard" },
    { label: "Analytics", icon: "📈", to: "/tutor-dashboard" },
    { label: "Messages", icon: "💬", to: "/tutor-dashboard" },
    { label: "Settings", icon: "⚙️", to: "/tutor-dashboard" },
  ]

  const menuItems = navItems.length > 0 ? navItems : defaultMenuItems

  const isActive = (path) => location.pathname === path

  return (
    <div className={`tutor-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">T</span>
          {!isCollapsed && <span className="logo-text">Trinfinity</span>}
        </div>
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <div className="sidebar-section">
        <p className="section-title">{!isCollapsed && "TUTOR"}</p>
        <nav className="menu-items">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isIconComponent = typeof item.icon === "function" || (item.icon && item.icon.$$typeof)
            
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`menu-item ${isActive(item.to) ? "active" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="menu-icon">
                  {isIconComponent ? <IconComponent size={18} /> : item.icon}
                </span>
                {!isCollapsed && <span className="menu-label">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{ height: "36px", width: "36px" }}>
            <ProfileDropdown userData={tutorData} onLogout={handleLogout} />
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <p className="user-name">{tutorName}</p>
              <p className="user-role">Tutor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TutorSidebar
