import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  BarChart3,
  RefreshCcw,
  Calendar,
  User,
  Crown, // Added for Manager/HR specific icon
} from "lucide-react";
import Navbar from "../../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

// Utility functions (moved outside the component for clarity)
const calculateDuration = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return "N/A";
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const diff = Math.abs(end.getTime() - start.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0 && minutes === 0) return "0m";
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "Present":
      return "text-emerald-700 bg-emerald-100 border-emerald-200";
    case "Absent":
      return "text-red-700 bg-red-100 border-red-200";
    case "Late":
      return "text-yellow-700 bg-yellow-100 border-yellow-200";
    case "On Leave":
      return "text-blue-700 bg-blue-100 border-blue-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
};

const formatTime = (time) => {
  if (!time) return "N/A";
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AttendanceMonitoringPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // New state for manager's name
  const [managerName, setManagerName] = useState("Manager");

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  // New function to fetch the logged-in manager's profile
  const fetchManagerProfile = async () => {
    try {
      // Assuming a /api/user/profile endpoint exists that returns user data
      const res = await axios.get(`${BASE_URL}/api/user/profile`, { headers });
      setManagerName(res.data.name || "Manager");
    } catch (err) {
      console.error("Failed to fetch manager profile:", err);
      // Fallback name is already "Manager"
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError("");
    try {
      // API endpoint for fetching today's records for all direct reports
      const res = await axios.get(`${BASE_URL}/api/hr/attendance/monitoring`, {
        headers,
      });
      setRecords(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerProfile();
    fetchAttendanceRecords();
  }, [headers]);

  // Calculate the current status breakdown for the header
  const statusCounts = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />
      <div className="mx-auto max-w-7xl p-8">
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2"
        >
          <Crown className="h-5 w-5" /> Welcome back, {managerName}
        </motion.p>
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-4 flex items-center gap-3"
        >
          <BarChart3 className="h-7 w-7 text-indigo-600" /> Today's Team
          Attendance
        </motion.h1>

        <p className="mb-6 text-gray-600 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Date:{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {error && (
          <div className="mb-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* Summary Card */}
        <div
          className={`p-6 rounded-3xl ${glass} mb-6 flex justify-around items-center`}
        >
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-sm font-medium text-gray-500">{status}</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  getStatusColor(status).split(" ")[0]
                }`}
              >
                {count}
              </p>
            </div>
          ))}

          {!Object.keys(statusCounts).length && !loading && (
            <p className="text-gray-500">No records to display for today.</p>
          )}
        </div>

        <button
          onClick={fetchAttendanceRecords}
          className="mb-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Records
        </button>

        {/* Conditional Content: Loading, Empty, or Data */}
        {loading ? (
          <div
            className={`p-10 rounded-3xl ${glass} text-center text-gray-500 flex items-center justify-center gap-2`}
          >
            <Loader2 className="h-5 w-5 animate-spin" /> Loading attendance
            data...
          </div>
        ) : records.length === 0 ? (
          <div
            className={`p-10 rounded-3xl ${glass} text-center text-gray-500`}
          >
            No attendance records found for your direct reports today.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <motion.div
                key={record._id}
                className={`p-6 rounded-3xl border flex justify-between items-center ${glass}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Employee Info */}
                <div className="flex items-center gap-4">
                  <User className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {record.employee.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {record.employee.email}
                    </p>
                  </div>
                </div>

                {/* Attendance Details */}
                <div className="flex items-center gap-6 text-sm text-center">
                  {/* Clock-In */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">In</span>
                    <span className="font-medium text-emerald-700">
                      {formatTime(record.clockIn)}
                    </span>
                  </div>
                  {/* Clock-Out */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Out</span>
                    <span className="font-medium text-red-700">
                      {formatTime(record.clockOut)}
                    </span>
                  </div>
                  {/* Duration */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Duration</span>
                    <span className="font-medium text-indigo-700">
                      {calculateDuration(
                        record.clockIn,
                        record.clockOut || new Date()
                      )}
                    </span>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
