import Sidebar from "../components/Sidebar";
import useNoBack from "../hooks/useNoBack";

export default function Dashboard() {
  useNoBack();

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px" }}>
        <h1>Dashboard</h1>
        <p>Total Students: 0</p>
        <p>Total Tutors: 0</p>
      </div>
    </div>
  );
}