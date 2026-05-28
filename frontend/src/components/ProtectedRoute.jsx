import { Navigate, useLocation } from "react-router-dom";
import { getStoredAuth, useAuth, dashboardPathFor } from "@/lib/auth";

function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();
  const stored = getStoredAuth();
  const token = auth?.token || stored.token;
  const user = auth?.user || stored.user;

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const tutorOnlyPaths = ["/tutor-dashboard", "/dashboard/tutor"];
  const studentOnlyPaths = ["/student-dashboard", "/dashboard/student"];

  if (user.role === "tutor" && studentOnlyPaths.includes(location.pathname)) {
    return <Navigate to={dashboardPathFor("tutor")} replace />;
  }

  if (user.role === "student" && tutorOnlyPaths.includes(location.pathname)) {
    return <Navigate to={dashboardPathFor("student")} replace />;
  }

  if (user.role === "tutor") {
    const isComplete = user.profileComplete ?? user.isProfileComplete ?? Boolean(user.status);
    if (!isComplete) {
      return <Navigate to="/register-tutor" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;