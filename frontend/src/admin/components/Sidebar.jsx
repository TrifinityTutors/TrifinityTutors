import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css"

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin");
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🎓 Admin Panel</h2>
      </div>

      <nav className="sidebar-menu">
        <Link to="/admin/dashboard" className="sidebar-link">
          <span className="icon">📊</span>
          Dashboard
        </Link>

        <Link to="/admin/students" className="sidebar-link">
          <span className="icon">👥</span>
          Students
        </Link>

        <Link to="/admin/tutors" className="sidebar-link">
          <span className="icon">👨‍🏫</span>
          Tutors
        </Link>
      </nav>

      <button onClick={logout} className="logout-btn">
        🚪 Logout
      </button>
    </div>
  );
}