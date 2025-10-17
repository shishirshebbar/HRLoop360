import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AIPerformance from "./pages/ai/AIPerformance";
import AIOffer from "./pages/ai/AIOffer";
import AISkills from "./pages/ai/AISkills";
import AISatisfaction from "./pages/ai/AISatisfaction";
import AIResumeScreener from "./pages/ai/AIResumeScreener";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected (one-by-one) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Management Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["Senior Manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* AI Tools - HR Only */}
        <Route
          path="/ai/performance"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <AIPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/offer"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <AIOffer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/skills"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <AISkills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/satisfaction"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <AISatisfaction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/resume-screener"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <AIResumeScreener />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
