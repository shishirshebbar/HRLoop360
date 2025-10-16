import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import CloseButton from "../components/CloseButton";
import {
  Users,
  UserPlus,
  Shield,
  Building2,
  Mail,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Crown,
  Briefcase,
  UserCircle2,
} from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

// Badge color map by role
const roleStyles = {
  "Management Admin": "bg-purple-100 text-purple-700 border-purple-200",
  "Senior Manager": "bg-amber-100 text-amber-700 border-amber-200",
  "HR Recruiter": "bg-sky-100 text-sky-700 border-sky-200",
  Employee: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// Skeleton loader
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200/70 rounded ${className}`} />
);

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR Recruiter",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const token = localStorage.getItem("token");

  const [hrs, setHrs] = useState([]);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [activeTab, setActiveTab] = useState("HR Recruiter");
  const [query, setQuery] = useState("");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
    []
  );

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setErr("");
      try {
        const [hrRes, mgrRes, empRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users?roles=HR%20Recruiter", { headers }),
          axios.get("http://localhost:5000/api/users?roles=Senior%20Manager", { headers }),
          axios.get("http://localhost:5000/api/users?roles=Employee", { headers }),
        ]);
        setHrs(hrRes.data || []);
        setManagers(mgrRes.data || []);
        setEmployees(empRes.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [headers]);

  const datasetByTab = useMemo(() => {
    switch (activeTab) {
      case "HR Recruiter":
        return hrs;
      case "Senior Manager":
        return managers;
      case "Employee":
        return employees;
      default:
        return [];
    }
  }, [activeTab, hrs, managers, employees]);

  const filtered = useMemo(() => {
    if (!query) return datasetByTab;
    const q = query.toLowerCase();
    return datasetByTab.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [datasetByTab, query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/admin/create-user", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessageType("success");
      setMessage("User created successfully!");
      // optimistic refresh: push into relevant list
      const created = { _id: Math.random().toString(36), ...form };
      if (form.role === "HR Recruiter") setHrs((p) => [created, ...p]);
      if (form.role === "Senior Manager") setManagers((p) => [created, ...p]);
      if (form.role === "Employee") setEmployees((p) => [created, ...p]);
      setForm({ name: "", email: "", password: "", role: form.role });
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />

      {/* Page header */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold"
            >
              Admin Dashboard
            </motion.h1>
            <p className="text-gray-600 mt-1">
              Create users, view teams, and manage access.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-indigo-600" />
            Role‑based access • Audit ready
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16 grid lg:grid-cols-3 gap-6">
        {/* Left column — Create user */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative p-6 rounded-3xl ${glass}`}
        >
          <div className="absolute right-4 top-4"><CloseButton /></div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Create new user</h2>
              <p className="text-sm text-gray-600">Invite by email and assign a role</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Full name</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <UserCircle2 className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Work email</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  placeholder="jane@company.com"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Mail className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative mt-1">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <Lock className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Role</label>
              <div className="relative mt-1">
                <select
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none appearance-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option>HR Recruiter</option>
                  <option>Senior Manager</option>
                  <option>Management Admin</option>
                  <option>Employee</option>
                </select>
                <ChevronRight className="h-5 w-5 absolute right-3 top-3.5 text-gray-400 rotate-90" />
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium inline-flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" /> Create user
            </button>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`mt-2 text-sm rounded-xl px-3 py-2 border ${
                    messageType === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {messageType === "success" ? (
                    <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {message}</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Right column — Lists & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={<Users />} label="Total Employees" value={employees.length + managers.length + hrs.length} />
            <MetricCard icon={<Building2 />} label="Managers" value={managers.length} />
            <MetricCard icon={<Briefcase />} label="Recruiters" value={hrs.length} />
            <MetricCard icon={<Crown />} label="Admins" value={0} />
          </div>

          {/* Tabbed table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`p-5 rounded-3xl ${glass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {[
                  "HR Recruiter",
                  "Senior Manager",
                  "Employee",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-full border text-sm transition ${
                      activeTab === t
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white/70 border-white/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  placeholder="Search name, email, role..."
                  className="pl-9 pr-10 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Filter className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/60 border-b">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {loading && (
                      <tr>
                        <td className="px-4 py-3" colSpan={3}>
                          <div className="grid grid-cols-3 gap-3">
                            <Skeleton className="h-6" />
                            <Skeleton className="h-6" />
                            <Skeleton className="h-6" />
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && filtered.map((u) => (
                      <motion.tr
                        key={u._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-white/60"
                      >
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full border ${roleStyles[u.role] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                            {u.role}
                          </span>
                        </td>
                      </motion.tr>
                    ))}

                    {!loading && !filtered.length && (
                      <tr>
                        <td className="px-4 py-10 text-center text-gray-500" colSpan={3}>
                          No records found.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {err && (
              <div className="mt-4 text-sm rounded-xl px-3 py-2 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {err}
              </div>
            )}

            {!loading && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:border-indigo-400"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-4 rounded-2xl ${glass}`}
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs text-gray-600 mt-1">{label}</div>
      </div>
    </motion.div>
  );
}
