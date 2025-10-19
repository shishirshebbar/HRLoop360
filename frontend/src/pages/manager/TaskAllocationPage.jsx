import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListChecks,
  UserCheck,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function TaskAllocationPage() {
  const [directReports, setDirectReports] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchDirectReports = async () => {
    setLoading(true);
    try {
      // This route was defined earlier: gets employees managed by the current user
      const res = await axios.get(`${BASE_URL}/api/users/direct-reports`, {
        headers,
      });
      setDirectReports(res.data);
      if (res.data.length > 0) {
        setAssigneeId(res.data[0]._id); // Set default assignee
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch direct reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectReports();
  }, [headers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    if (!assigneeId || !title) {
      setError("Title and Assignee are required.");
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/hr/task/assign`,
        {
          title,
          description,
          assigneeId,
          dueDate: dueDate || null,
        },
        { headers }
      );

      setMessage(`Task "${title}" successfully allocated!`);
      // Clear form (except for assignee)
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to allocate task.");
    } finally {
      setSubmitting(false);
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
          <ListChecks className="h-7 w-7 text-indigo-600" /> Task Allocation
        </motion.h1>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`p-8 rounded-3xl ${glass}`}
        >
          <h2 className="text-xl font-semibold mb-6">Assign a New Task</h2>

          {loading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading reports...
            </div>
          ) : directReports.length === 0 ? (
            <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
              You have no direct reports to assign tasks to.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee (Employee)
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none appearance-none bg-white"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    required
                  >
                    {directReports.map((report) => (
                      <option key={report._id} value={report._id}>
                        {report.name} ({report.email})
                      </option>
                    ))}
                  </select>
                  <UserCheck className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Q3 Sales Report"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed instructions..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitting || directReports.length === 0}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Allocating..." : "Allocate Task"}
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
          )}
        </motion.div>
      </div>
    </div>
  );
}
