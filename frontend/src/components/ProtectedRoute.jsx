import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const student = localStorage.getItem("student");
  const tutor = localStorage.getItem("tutor");

  // Allow access if user has token OR student data OR tutor data
  if (!token && !student && !tutor) {
    return <Navigate to="/" />; // redirect to home
  }

  return children;
}

export default ProtectedRoute;