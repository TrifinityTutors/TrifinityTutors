import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin");
    navigate("/admin-login", { replace: true });
  };

  return (
    <div style={{ width: "200px", borderRight: "1px solid black" }}>
      <h3>Admin Panel</h3>

      <Link to="/admin/dashboard">Dashboard</Link><br />
      <Link to="/admin/students">Students</Link><br />
      <Link to="/admin/tutors">Tutors</Link><br />

      <button onClick={logout}>Logout</button>
    </div>
  );
}