import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Send,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function LeaveRequestPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("Casual");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchLeaveHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/hr/leave/history`, {
        headers,
      });
      setHistory(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leave history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, [headers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    if (!startDate || !endDate || !reason) {
      setError("All fields are required.");
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/hr/leave/request`,
        {
          startDate,
          endDate,
          reason,
          type,
        },
        { headers }
      );

      setMessage("Leave request submitted successfully!");
      // Clear form
      setStartDate("");
      setEndDate("");
      setReason("");
      setType("Casual");
      // Refresh history
      fetchLeaveHistory();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "Rejected":
        return "text-red-700 bg-red-100 border-red-200";
      default:
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />
      <div className="mx-auto max-w-6xl p-8">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 flex items-center gap-3"
        >
          <Calendar className="h-7 w-7 text-indigo-600" /> Apply for Leave
        </motion.h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submission Form */}
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`p-6 rounded-3xl ${glass} h-fit`}
          >
            <h2 className="text-xl font-semibold mb-4">New Leave Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Annual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your reason for leave..."
                  required
                ></textarea>
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Submitting..." : "Submit Request"}
              </motion.button>

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
            </form>
          </motion.div>

          {/* History */}
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-3xl ${glass}`}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5" /> Leave History
            </h2>

            {loading ? (
              <div className="text-center py-10 text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No previous leave requests found.
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 rounded-xl border ${getStatusColor(
                      item.status
                    )}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{item.type} Leave</p>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full border`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      {new Date(item.startDate).toLocaleDateString()} -{" "}
                      {new Date(item.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs mt-2 italic">{item.reason}</p>
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      Applied: {new Date(item.appliedOn).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
