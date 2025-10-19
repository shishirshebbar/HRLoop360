import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Menu,
  X,
  LogOut,
  UserCircle2,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  BadgeCheck,
  CheckCircle, // New icon for approvals
  ListChecks, // New icon for task allocation
  Clock,
} from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.05)]";

const roleNav = (role) => {
  switch (role) {
    case "Management Admin":
      return [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/reports", label: "Reports", icon: BarChart3 },
        {
          to: "/admin/assign-manager",
          label: "Assign Manager",
          icon: Users,
        },
      ];
    case "Senior Manager":
      return [
        { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
        {
          to: "/manager/leave-approval",
          label: "Leave Approval",
          icon: CheckCircle,
        },
        {
          to: "/manager/task-allocation",
          label: "Task Allocation",
          icon: ListChecks,
        },
        {
          to: "/manager/attendance-monitoring",
          label: "Attendance Monitoring",
          icon: Clock,
        },
      ];
    case "HR Recruiter":
      return [
        { to: "/hr", label: "Pipelines", icon: Briefcase },
        { to: "/hr/candidates", label: "Candidates", icon: Users },
        { to: "/hr/jobs", label: "Jobs", icon: FileText },
        { to: "/hr/settings", label: "Settings", icon: Settings },
      ];
    default:
      return [
        { to: "/employee", label: "Profile", icon: UserCircle2 },
        {
          to: "/employee/leave-request",
          label: "Leave Request",
          icon: Calendar,
        },
        {
          to: "/employee/task-allocated",
          label: "Task Allocated",
          icon: ListChecks,
        },
        { to: "/employee/attendance", label: "Attendance", icon: Clock },
      ];
  }
};

export default function Navbar({ sticky = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      setUser(u);
    } catch {}
  }, []);

  const links = useMemo(
    () => roleNav(user?.role?.trim?.() || "Employee"),
    [user]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <header className={`${sticky ? "sticky top-0 z-50" : ""} ${glass}`}>
      <div className="relative mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.div
            initial={{ rotate: -12, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
          >
            <Bot className="h-7 w-7 text-indigo-600" />
          </motion.div>
          <span className="font-semibold">AetherHR</span>
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
            AI HRMS
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`relative px-3 py-2 rounded-xl text-sm transition flex items-center gap-2 hover:bg-white/70 ${
                isActive(to) ? "text-indigo-700" : "text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              {isActive(to) && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-indigo-100"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 mr-2">
            <UserCircle2 className="h-5 w-5 text-gray-500" />
            <span className="max-w-[12rem] truncate">
              {user?.name || "Guest"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition text-sm"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <button
            className="md:hidden p-2 rounded-lg border border-gray-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/60"
          >
            <div className="mx-auto max-w-7xl px-4 py-2 flex flex-col gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => {
                    navigate(to);
                    setMobileOpen(false);
                  }}
                  className={`relative px-3 py-2 rounded-xl text-sm transition flex items-center gap-2 hover:bg-white/70 ${
                    isActive(to)
                      ? "text-indigo-700 bg-indigo-50"
                      : "text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition text-sm"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
