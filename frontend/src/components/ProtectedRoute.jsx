import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role not authorized → redirect to login
  if (allowedRoles && !allowedRoles.includes(user.role.trim())) {
    return <Navigate to="/" replace />;
  }

  // Authorized → render children
  return children;
}
