import Sidebar from "../components/Sidebar";
import useNoBack from "../hooks/useNoBack";

export default function Students() {
  useNoBack();

  const data = [
    { name: "Rahul", class: "10th" },
    { name: "Priya", class: "8th" }
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px" }}>
        <h1>Students</h1>

        {data.map((s, i) => (
          <div key={i} style={{
            border: "1px solid black",
            padding: "10px",
            margin: "10px",
            borderRadius: "8px"
          }}>
            <h3>{s.name}</h3>
            <p>{s.class}</p>
            <button>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}