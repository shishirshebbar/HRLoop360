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
import AdminAssignManager from "./pages/AdminAssignManager";
import LeaveApprovalPage from "./pages/manager/LeaveApprovalPage";
import TaskAllocationPage from "./pages/manager/TaskAllocationPage";
import AttendanceMonitoringPage from "./pages/manager/AttendanceMonitoringPage";
import LeaveRequestPage from "./pages/employee/LeaveRequestPage";
import TaskAllocatedPage from "./pages/employee/TaskAllocatedPage";
import AttendancePage from "./pages/employee/AttendancePage";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import HRCandidates from "./pages/HRCandidates";
import HRJobs from "./pages/HRJobs";
import HRSettings from "./pages/HRSettings";

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
          path="/admin/assign-manager"
          element={
            <ProtectedRoute allowedRoles={["Management Admin"]}>
              <AdminAssignManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Management Admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["Management Admin"]}>
              <AdminReports />
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
          path="/manager/leave-approval"
          element={
            <ProtectedRoute allowedRoles={["Senior Manager"]}>
              <LeaveApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/task-allocation"
          element={
            <ProtectedRoute allowedRoles={["Senior Manager"]}>
              <TaskAllocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/attendance-monitoring"
          element={
            <ProtectedRoute allowedRoles={["Senior Manager"]}>
              <AttendanceMonitoringPage />
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
          path="/hr/candidates"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <HRCandidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <HRJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/settings"
          element={
            <ProtectedRoute allowedRoles={["HR Recruiter"]}>
              <HRSettings />
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
        <Route
          path="/employee/leave-request"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <LeaveRequestPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/task-allocated"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <TaskAllocatedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <AttendancePage />
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
