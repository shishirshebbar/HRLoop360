<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { Users, AlertCircle, Loader2 } from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ManagerDashboard() {
  const [directReports, setDirectReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  useEffect(() => {
    const fetchDirectReports = async () => {
      setLoading(true);
      setError("");
      try {
        // Calls the new backend route
        const res = await axios.get(`${BASE_URL}/api/users/direct-reports`, {
          headers,
        });
        setDirectReports(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load your team data.");
=======
// src/pages/ManagerDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  User2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/users?roles=Employee",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(res.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load employees");
>>>>>>> 0aa482e365723ad9899daba81968225e82f6e432
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD

    fetchDirectReports();
  }, [headers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl md:text-3xl font-bold text-gray-800"
        >
          Manager Dashboard 📊
        </motion.h1>
        <p className="text-gray-600 mt-1">
          Welcome, {user?.name}. Here are your direct reports and key data.
        </p>

        {error && (
          <div className="mt-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`p-6 rounded-3xl ${glass}`}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-amber-600" /> My Team (
              {directReports.length})
            </h2>

            {loading ? (
              <div className="text-center p-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading team data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-white/60 border-b">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Email
                      </th>
                      {/* Placeholder for other data */}
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {directReports.map((emp) => (
                      <tr key={emp._id} className="border-t hover:bg-white/60">
                        <td className="px-4 py-3 font-medium">{emp.name}</td>
                        <td className="px-4 py-3 text-gray-700">{emp.email}</td>
                        {/* Placeholder for real data (e.g., pending leave count) */}
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!directReports.length && (
                      <tr>
                        <td
                          className="px-4 py-10 text-center text-gray-500"
                          colSpan={3}
                        >
                          You currently have no direct reports assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
          {/* You would add Task, Attendance, Performance, and Leave Request components/sections here */}
        </div>
=======
    fetchEmployees();
  }, []);

  const counts = useMemo(
    () => ({
      total: employees.length,
    }),
    [employees]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? employees.filter(
          (e) =>
            e.name?.toLowerCase().includes(q) ||
            e.email?.toLowerCase().includes(q) ||
            e.role?.toLowerCase().includes(q)
        )
      : employees.slice();

    base.sort((a, b) => {
      const dir = sortBy.dir === "asc" ? 1 : -1;
      const ka = (a[sortBy.key] || "").toString().toLowerCase();
      const kb = (b[sortBy.key] || "").toString().toLowerCase();
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      return 0;
    });

    return base;
  }, [employees, query, sortBy]);

  function toggleSort(key) {
    setSortBy((p) =>
      p.key === key ? { key, dir: p.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold"
            >
              Manager Dashboard
            </motion.h1>
            <p className="text-gray-600 mt-1">Your team roster, quick actions, and insights.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-indigo-600" /> {counts.total} employees
          </div>
        </div>
      </div>

{/* Metrics */}
<div className="mx-auto max-w-7xl px-4 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
  <MetricCard label="Total Employees" value={counts.total} icon={<Users />} />
</div>


      {/* Table Card */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-5 rounded-3xl ${glass}`}
        >
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search name, email, role…"
                className="pl-9 pr-10 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {!loading && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:border-indigo-400"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            )}
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/60 border-b">
                <tr>
                  <SortableTh
                    activeKey={sortBy.key}
                    dir={sortBy.dir}
                    colKey="name"
                    onClick={toggleSort}
                  >
                    Name
                  </SortableTh>
                  <SortableTh
                    activeKey={sortBy.key}
                    dir={sortBy.dir}
                    colKey="email"
                    onClick={toggleSort}
                  >
                    Email
                  </SortableTh>
                  <SortableTh
                    activeKey={sortBy.key}
                    dir={sortBy.dir}
                    colKey="role"
                    onClick={toggleSort}
                  >
                    Role
                  </SortableTh>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading skeleton */}
                {loading && (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-40" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-52" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-9 w-28 rounded-xl" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Data rows */}
                <AnimatePresence initial={false}>
                  {!loading &&
                    filtered.map((u) => (
                      <motion.tr
                        key={u._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-white/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} />
                            <div className="leading-tight">
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-gray-500">{u._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <InlineIconText icon={<Mail className="h-4 w-4" />} text={u.email} />
                        </td>
                        <td className="px-4 py-3">
                          <RolePill role={u.role} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-sm px-3 py-2 rounded-xl border hover:border-indigo-400"
                              title="View (stub)"
                            >
                              View
                            </button>
                            <button
                              className="text-sm px-3 py-2 rounded-xl border hover:border-indigo-400"
                              title="Message (stub)"
                            >
                              Message
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}

                  {!loading && !filtered.length && (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-500" colSpan={4}>
                        No employees found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Error */}
          {err && (
            <div className="mt-4 text-sm rounded-xl px-3 py-2 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
              {err}
            </div>
          )}
        </motion.div>
>>>>>>> 0aa482e365723ad9899daba81968225e82f6e432
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

/* ---------- Small UI helpers ---------- */

function SortableTh({ children, activeKey, dir, colKey, onClick }) {
  const active = activeKey === colKey;
  return (
    <th
      className="px-4 py-3 text-sm font-semibold text-gray-600 select-none"
      onClick={() => onClick(colKey)}
    >
      <span className="inline-flex items-center gap-1 cursor-pointer">
        {children}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )
        ) : null}
      </span>
    </th>
  );
}

function MetricCard({ label, value, icon }) {
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

function RolePill({ role }) {
  const map = {
    Employee: "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Senior Manager": "bg-amber-100 text-amber-700 border-amber-200",
    "Management Admin": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "HR Recruiter": "bg-sky-100 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${
        map[role] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {role}
    </span>
  );
}

function Avatar({ name = "" }) {
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">
      {initials || <User2 className="h-4 w-4" />}
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200/70 rounded ${className}`} />;
}

function InlineIconText({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span>{text}</span>
    </span>
  );
}
>>>>>>> 0aa482e365723ad9899daba81968225e82f6e432
