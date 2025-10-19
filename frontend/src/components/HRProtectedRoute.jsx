import { Navigate } from "react-router-dom";


export default function HRProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userRaw);
    if (user?.role === "HR Recruiter") return children;
  } catch {}
  return <Navigate to="/" replace />;
}
