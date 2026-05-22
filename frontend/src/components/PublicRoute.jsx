import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  // If tutor is logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, show the public page
  return children;
}

export default PublicRoute;
