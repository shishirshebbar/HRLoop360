// frontend/src/pages/employee/AttendancePage.jsx

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History, // Added
  Calendar, // Added
} from "lucide-react";
import Navbar from "../../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function AttendancePage() {
  const [status, setStatus] = useState("Checking...");
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // <--- NEW STATE

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  // --- NEW FUNCTION: Fetch History ---
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/hr/attendance/history`, {
        headers,
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err); // Optionally set an error state for the history section
    }
  };

  // Function to check today's status
  const checkTodayStatus = async () => {
    setStatus("Checking...");
    try {
      const todayKey = new Date().toISOString().split("T")[0];
      const storedStatus = JSON.parse(
        localStorage.getItem(`attendance_status_${todayKey}`)
      );

      if (storedStatus) {
        setClockInTime(
          storedStatus.clockIn ? new Date(storedStatus.clockIn) : null
        );
        setClockOutTime(
          storedStatus.clockOut ? new Date(storedStatus.clockOut) : null
        );

        if (storedStatus.clockIn && storedStatus.clockOut) {
          setStatus("Clocked Out");
        } else if (storedStatus.clockIn) {
          setStatus("Clocked In");
        } else {
          setStatus("Not Clocked In");
        }
      } else {
        setStatus("Not Clocked In");
      }
    } catch (e) {
      console.error("Could not determine attendance status:", e);
    } finally {
      setTimeout(() => {
        if (status === "Checking...") setStatus("Not Clocked In");
      }, 500);
    }
  };

  useEffect(() => {
    checkTodayStatus();
    fetchHistory(); // <--- CALL NEW FETCH
  }, [headers]);

  const handleClockAction = async (action) => {
    setMessage("");
    setError("");
    setIsProcessing(true);

    const todayKey = new Date().toISOString().split("T")[0];
    const endpoint =
      action === "in"
        ? "/api/hr/attendance/clock-in"
        : "/api/hr/attendance/clock-out";

    try {
      const apiCall = action === "in" ? axios.post : axios.patch;

      const res = await apiCall(BASE_URL + endpoint, {}, { headers });
      const newRecord = res.data.attendance;

      if (action === "in") {
        setClockInTime(new Date(newRecord.clockIn));
        setClockOutTime(null);
        setStatus("Clocked In");
        setMessage("Clock-in recorded successfully!");

        localStorage.setItem(
          `attendance_status_${todayKey}`,
          JSON.stringify({
            clockIn: newRecord.clockIn,
            clockOut: null,
          })
        );
      } else {
        // Clock out
        setClockOutTime(new Date(newRecord.clockOut));
        setStatus("Clocked Out");
        setMessage("Clock-out recorded successfully! Have a great day.");

        const stored =
          JSON.parse(localStorage.getItem(`attendance_status_${todayKey}`)) ||
          {};
        localStorage.setItem(
          `attendance_status_${todayKey}`,
          JSON.stringify({
            ...stored,
            clockOut: newRecord.clockOut,
          })
        );
      }
      fetchHistory(); // <--- RE-FETCH HISTORY AFTER SUCCESSFUL ACTION
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${action === "in" ? "clock in" : "clock out"}.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const timeDifference = (start, end) => {
    if (!start || !end) return "N/A";
    const diff = Math.abs(end.getTime() - start.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />
      <div className="mx-auto max-w-4xl p-8">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 flex items-center gap-3"
        >
          <Clock className="h-7 w-7 text-indigo-600" /> Daily Attendance
        </motion.h1>
        {/* Current Status Card */}
        <div className={`p-8 rounded-3xl ${glass} space-y-6 mb-12`}>
          <h2 className="text-xl font-semibold border-b pb-3 flex justify-between items-center">
            Today: {new Date().toLocaleDateString("en-GB")}{" "}
            {/* MODIFIED: Added 'en-GB' for DD/MM/YYYY */}
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full border ${
                status === "Clocked In"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : status === "Clocked Out"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {status === "Checking..." ? "Loading Status" : status}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="p-4 bg-gray-50 rounded-xl border">
              <p className="text-sm font-medium text-gray-500">Clock-In Time</p>

              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {clockInTime ? clockInTime.toLocaleTimeString() : "--:--"}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border">
              <p className="text-sm font-medium text-gray-500">
                Clock-Out Time
              </p>

              <p className="text-2xl font-bold mt-1 text-red-600">
                {clockOutTime ? clockOutTime.toLocaleTimeString() : "--:--"}
              </p>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl text-center font-semibold text-indigo-700">
            Total Hours:
            {timeDifference(clockInTime, clockOutTime || new Date())}
            {status === "Clocked In" && (
              <span className="text-sm font-normal italic">(and counting)</span>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <motion.button
              onClick={() => handleClockAction("in")}
              disabled={status !== "Not Clocked In" || isProcessing}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing && status === "Not Clocked In" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Clock In
            </motion.button>

            <motion.button
              onClick={() => handleClockAction("out")}
              disabled={status !== "Clocked In" || isProcessing}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing && status === "Clocked In" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Clock Out
            </motion.button>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 text-sm rounded-xl px-4 py-3 border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-2 w-full"
              >
                <CheckCircle2 className="h-4 w-4" /> {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2 w-full"
              >
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- NEW: Attendance History Section --- */}
        <motion.h2
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2"
        >
          <History className="h-6 w-6 text-indigo-500" /> Past 30 Days History
        </motion.h2>

        <div className={`p-6 rounded-3xl ${glass} space-y-3`}>
          {history.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">
              No recent attendance records found.
            </p>
          ) : (
            history.map((record) => (
              <div
                key={record._id}
                className="flex justify-between items-center p-3 rounded-xl border bg-gray-50 hover:bg-white transition"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />

                  <span className="font-semibold text-gray-800">
                    {new Date(record.date).toLocaleDateString("en-GB")}{" "}
                    {/* MODIFIED: Added 'en-GB' for DD/MM/YYYY */}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {/* Clock In/Out Times */}
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">In</span>

                    <span className="font-medium text-emerald-600">
                      {formatTime(record.clockIn)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">Out</span>

                    <span className="font-medium text-red-600">
                      {formatTime(record.clockOut)}
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
