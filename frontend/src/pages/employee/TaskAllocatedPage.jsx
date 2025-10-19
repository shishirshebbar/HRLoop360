import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ListChecks,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Check,
  Clock,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function TaskAllocatedPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/hr/task/allocated`, {
        headers,
      });
      setTasks(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch allocated tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [headers]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    setError("");
    try {
      // 1. Send API request to update the status in the database
      await axios.patch(
        `${BASE_URL}/api/hr/task/update/${taskId}`,
        {
          status: newStatus,
        },
        { headers }
      ); // 2. Update the local state based on the new status

      if (newStatus === "Completed") {
        // 🚀 CORRECTED LOGIC: Use .filter() to remove the task from the array
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
      } else {
        // Fallback (e.g., if you had an option to change status to 'In Progress')
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to update task status to ${newStatus}.`
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "In Progress":
        return "text-blue-700 bg-blue-100 border-blue-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
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
          <ListChecks className="h-7 w-7 text-indigo-600" /> Tasks Allocated
        </motion.h1>

        {error && (
          <div className="mb-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <button
          onClick={fetchTasks}
          className="mb-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh Tasks
        </button>

        {loading ? (
          <div
            className={`p-10 rounded-3xl ${glass} text-center text-gray-500 flex items-center justify-center gap-2`}
          >
            <Loader2 className="h-5 w-5 animate-spin" /> Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div
            className={`p-10 rounded-3xl ${glass} text-center text-gray-500`}
          >
            Congratulations! No tasks are currently assigned to you.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status !== "Completed")
              .map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl border ${glass}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {task.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusStyles(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {task.description}
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Due:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "N/A"}
                    </p>

                    {task.status !== "Completed" ? (
                      <button
                        onClick={() =>
                          handleUpdateStatus(task._id, "Completed")
                        }
                        disabled={updatingTaskId === task._id}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition disabled:opacity-50"
                      >
                        {updatingTaskId === task._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Mark as Complete
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                        <Check className="h-4 w-4" /> Finished
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
