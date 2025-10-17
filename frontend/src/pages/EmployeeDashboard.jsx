// src/pages/EmployeeDashboard.jsx
import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import {
  Briefcase,
  CalendarCheck,
  TrendingUp,
  Clock,
  User2,
} from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function EmployeeDashboard() {
  const metrics = [
    {
      label: "Attendance",
      value: "95%",
      icon: <CalendarCheck className="h-5 w-5" />,
      desc: "This month’s attendance rate",
    },
    {
      label: "Projects",
      value: "3 Active",
      icon: <Briefcase className="h-5 w-5" />,
      desc: "Ongoing assigned projects",
    },
    {
      label: "Performance",
      value: "Exceeds",
      icon: <TrendingUp className="h-5 w-5" />,
      desc: "Last evaluation rating",
    },
  ];

  const activities = [
    {
      time: "Today",
      text: "Completed daily standup and updated task tracker.",
    },
    {
      time: "Yesterday",
      text: "Pushed UI bug fixes to HR Portal module.",
    },
    {
      time: "2 days ago",
      text: "Reviewed pull requests from design team.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold"
            >
              Employee Dashboard
            </motion.h1>
            <p className="text-gray-600">
              Overview of your current performance and activities.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User2 className="h-5 w-5 text-indigo-600" />
            Welcome back!
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-3xl ${glass}`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
                  {m.icon}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold">{m.value}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">
                  {m.label}
                </div>
                <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-6 rounded-3xl ${glass}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-l-2 border-indigo-200 pl-3"
              >
                <div className="text-xs text-gray-500 w-20">{a.time}</div>
                <div className="text-gray-800 text-sm flex-1">{a.text}</div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Placeholder for future sections */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-8 text-center text-gray-500 rounded-3xl ${glass}`}
        >
          Coming soon: task tracking, attendance summary, and performance goals.
        </motion.div>
      </div>
    </div>
  );
}
