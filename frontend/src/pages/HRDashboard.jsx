import React, { useEffect, useMemo, useState } from "react";
import FeatureCard from "../components/FeatureCard";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Fingerprint, Gauge, BadgeCheck, BrainCircuit, LayoutDashboard } from "lucide-react";

import { Users, Search, AlertCircle, RefreshCw, Briefcase, Crown, UserCheck, BarChart3 } from "lucide-react";
import GenieChatWidget from "../components/GenieChatWidget";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function HRDashboard() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/users?roles=Employee,Senior%20Manager",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPeople(res.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  const counts = useMemo(() => {
    const emps = people.filter((p) => p.role === "Employee").length;
    const mgrs = people.filter((p) => p.role === "Senior Manager").length;
    return { total: people.length, emps, mgrs };
  }, [people]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return people
      .filter((p) => (activeTab === "All" ? true : p.role === activeTab))
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q)
      );
  }, [people, query, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />
      <GenieChatWidget />
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4">
       {/* AI HR Lifecycle – Clickable Cycle FIRST */}
<div className="mx-auto max-w-7xl px-4 pb-6">
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className={`relative ${glass} rounded-3xl p-8 overflow-hidden`}
  >
    <h3 className="text-center text-xl font-bold text-indigo-700 mb-1">
      360° AI-Powered HR–Employee Journey
    </h3>
    <p className="text-center text-s text-gray-600 mb-4">
      <span className="font-medium text-indigo-700">Tip:</span> Click any module in the cycle to open its tool.
    </p>

    <div className="relative mx-auto h-[22rem] md:h-[24rem] w-full">
      {/* soft conic ring */}
      <div
        className="absolute inset-6 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(99,102,241,.18), rgba(14,165,233,.18), rgba(16,185,129,.18), rgba(139,92,246,.18), rgba(217,70,239,.18), rgba(99,102,241,.18))",
          boxShadow: "inset 0 0 40px rgba(0,0,0,.04)",
        }}
      />

      {/* rotating arrow ring */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 m-auto h-[80%] w-[80%]"
        initial={{ rotate: -90 }}
        animate={{ rotate: 270 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(79,70,229,0.6)" />
          </marker>
        </defs>
        <circle
          cx="100" cy="100" r="85"
          fill="none"
          stroke="rgba(79,70,229,.35)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
      </motion.svg>

      {/* center label */}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Continuous</div>
          <div className="text-lg font-bold">AI HR Loop</div>
          <div className="text-xs text-gray-500">Insights → Actions → Outcomes</div>
        </div>
      </div>

      {/* 1. AI Resume Screening */}
<motion.div
  className="absolute top-2 left-1/2 -translate-x-1/2"
  whileHover={{ scale: 1.06, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  <Link
    to="/ai/resume-screener"
    className="relative px-3 py-2 rounded-xl text-white shadow-xl ring-1 ring-white/30 border border-white/20 bg-indigo-600 text-xs flex items-center gap-2 hover:opacity-95 transition-all hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2 hover:ring-offset-white"
    aria-label="Open AI Resume Screening"
    title="Open AI Resume Screening"
  >
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white/90">
      <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
    </span>
    <span className="absolute -z-10 inset-0 rounded-xl blur-md opacity-0 hover:opacity-100 transition"
          style={{ background: "radial-gradient(120px 60px at 50% 50%, rgba(99,102,241,.45), transparent)" }} />
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
      <Fingerprint className="h-4 w-4" />
    </span>
    <span className="whitespace-pre leading-tight">AI Resume{'\n'}Screening</span>
  </Link>
</motion.div>

{/* 2. Skill Gaps Analyzer */}
<motion.div
  className="absolute left-2 top-1/2 -translate-y-1/2"
  whileHover={{ scale: 1.06, x: 2 }}
  whileTap={{ scale: 0.98 }}
>
  <Link
    to="/ai/skills"
    className="relative px-3 py-2 rounded-xl text-white shadow-xl ring-1 ring-white/30 border border-white/20 bg-sky-600 text-xs flex items-center gap-2 hover:opacity-95 transition-all hover:ring-2 hover:ring-sky-300 hover:ring-offset-2 hover:ring-offset-white"
    aria-label="Open Skill Gaps Analyzer"
    title="Open Skill Gaps Analyzer"
  >
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white/90">
      <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
    </span>
    <span className="absolute -z-10 inset-0 rounded-xl blur-md opacity-0 hover:opacity-100 transition"
          style={{ background: "radial-gradient(120px 60px at 50% 50%, rgba(14,165,233,.45), transparent)" }} />
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
      <Gauge className="h-4 w-4" />
    </span>
    <span className="whitespace-pre leading-tight">Skill Gaps{'\n'}Analyzer</span>
  </Link>
</motion.div>

{/* 3. Offer Acceptance Optimizer */}
<motion.div
  className="absolute bottom-2 left-1/4 -translate-x-1/2"
  whileHover={{ scale: 1.06, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  <Link
    to="/ai/offer"
    className="relative px-3 py-2 rounded-xl text-white shadow-xl ring-1 ring-white/30 border border-white/20 bg-emerald-600 text-xs flex items-center gap-2 hover:opacity-95 transition-all hover:ring-2 hover:ring-emerald-300 hover:ring-offset-2 hover:ring-offset-white"
    aria-label="Open Offer Acceptance Optimizer"
    title="Open Offer Acceptance Optimizer"
  >
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white/90">
      <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
    </span>
    <span className="absolute -z-10 inset-0 rounded-xl blur-md opacity-0 hover:opacity-100 transition"
          style={{ background: "radial-gradient(120px 60px at 50% 50%, rgba(16,185,129,.45), transparent)" }} />
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
      <BadgeCheck className="h-4 w-4" />
    </span>
    <span className="whitespace-pre leading-tight">Offer{'\n'}Optimizer</span>
  </Link>
</motion.div>

{/* 4. Performance Prediction */}
<motion.div
  className="absolute bottom-2 right-1/4 translate-x-1/2"
  whileHover={{ scale: 1.06, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  <Link
    to="/ai/performance"
    className="relative px-3 py-2 rounded-xl text-white shadow-xl ring-1 ring-white/30 border border-white/20 bg-violet-600 text-xs flex items-center gap-2 hover:opacity-95 transition-all hover:ring-2 hover:ring-violet-300 hover:ring-offset-2 hover:ring-offset-white"
    aria-label="Open Performance Prediction"
    title="Open Performance Prediction"
  >
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white/90">
      <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
    </span>
    <span className="absolute -z-10 inset-0 rounded-xl blur-md opacity-0 hover:opacity-100 transition"
          style={{ background: "radial-gradient(120px 60px at 50% 50%, rgba(139,92,246,.45), transparent)" }} />
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
      <BrainCircuit className="h-4 w-4" />
    </span>
    <span className="whitespace-pre leading-tight">Performance{'\n'}Prediction</span>
  </Link>
</motion.div>

{/* 5. Satisfaction Prediction */}
<motion.div
  className="absolute right-2 top-1/2 -translate-y-1/2"
  whileHover={{ scale: 1.06, x: -2 }}
  whileTap={{ scale: 0.98 }}
>
  <Link
    to="/ai/satisfaction"
    className="relative px-3 py-2 rounded-xl text-white shadow-xl ring-1 ring-white/30 border border-white/20 bg-fuchsia-600 text-xs flex items-center gap-2 hover:opacity-95 transition-all hover:ring-2 hover:ring-fuchsia-300 hover:ring-offset-2 hover:ring-offset-white"
    aria-label="Open Satisfaction Prediction"
    title="Open Satisfaction Prediction"
  >
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white/90">
      <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
    </span>
    <span className="absolute -z-10 inset-0 rounded-xl blur-md opacity-0 hover:opacity-100 transition"
          style={{ background: "radial-gradient(120px 60px at 50% 50%, rgba(217,70,239,.45), transparent)" }} />
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
      <LayoutDashboard className="h-4 w-4" />
    </span>
    <span className="whitespace-pre leading-tight">Satisfaction{'\n'}Prediction</span>
  </Link>
</motion.div>
    </div>

    <p className="mt-6 text-xs text-gray-500 text-center">
      Click a module to open it: Resume Screening → Skill Alignment → Offer Optimization → Performance → Satisfaction → back to Hiring Insights
    </p>
  </motion.div>
</div>


        <div className="flex items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold"
            >
              HR Dashboard
            </motion.h1>
            <p className="text-gray-600 mt-1">People overview, search and AI tooling.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-indigo-600" /> {counts.total} users
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mx-auto max-w-7xl px-4 pb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Users />} label="Total People" value={counts.total} />
        <MetricCard icon={<UserCheck />} label="Employees" value={counts.emps} />
        <MetricCard icon={<Crown />} label="Senior Managers" value={counts.mgrs} />
        <MetricCard
          icon={<BarChart3 />}
          label="Coverage"
          value={`${counts.total ? Math.round((counts.emps / counts.total) * 100) : 0}%`}
        />
      </div>

      {/* People Table */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-5 rounded-3xl ${glass}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {["All", "Employee", "Senior Manager"].map((t) => (
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
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          <RolePill role={u.role} />
                        </td>
                      </motion.tr>
                    ))}

                  {!loading && !filtered.length && (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-500" colSpan={3}>
                        No users found.
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

      {/* AI Features
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" /> AI Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            title="Performance Prediction"
            description="Score, risk, key drivers, and actionable coaching tips."
            to="/ai/performance"
          />
          <FeatureCard
            title="Offer Acceptance Optimizer"
            description="Predict acceptance probability and get what-if levers."
            to="/ai/offer"
          />
          <FeatureCard
            title="Skill Gaps Analyzer"
            description="Compare profile vs JD, see strengths, gaps, and plan."
            to="/ai/skills"
          />
          <FeatureCard
            title="Satisfaction Prediction"
            description="Pulse survey blend, team score, heatmap, actions."
            to="/ai/satisfaction"
          />
          <FeatureCard
            title="AI Resume Screener"
            description="Upload resumes, get fit scores, explanations, and shortlist."
            to="/ai/resume-screener"
          />
        </div>
      </section> */}
    </div>
  );
}

function RolePill({ role }) {
  const map = {
    "Senior Manager": "bg-amber-100 text-amber-700 border-amber-200",
    Employee: "bg-emerald-100 text-emerald-700 border-emerald-200",
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

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200/70 rounded ${className}`} />;
}
