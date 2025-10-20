import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users } from "lucide-react";

const glass = "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function HRJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: "", location: "", openings: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/hr/jobs", { headers });
        setJobs(res.data || []);
      } catch {
        setJobs([
          { _id: "j1", title: "Frontend Engineer", location: "Bengaluru", openings: 2 },
          { _id: "j2", title: "HR Executive", location: "Remote", openings: 1 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const createJob = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    try {
      const res = await axios.post("http://localhost:5000/api/hr/jobs", form, { headers });
      setJobs((p) => [res.data, ...p]);
      setForm({ title: "", location: "", openings: 1 });
    } catch {
      // optimistic mock
      setJobs((p) => [{ _id: Math.random().toString(36), ...form }, ...p]);
      setForm({ title: "", location: "", openings: 1 });
    }
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Jobs</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.form
            onSubmit={createJob}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-3xl ${glass}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              <div className="font-semibold">Create Job</div>
            </div>

            <div className="space-y-3">
              <input
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400"
                placeholder="Job title (e.g., Data Scientist)"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                required
              />
              <input
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400"
                placeholder="Location (e.g., Remote / Bengaluru)"
                value={form.location}
                onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                required
              />
              <input
                type="number"
                min={1}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400"
                placeholder="Openings"
                value={form.openings}
                onChange={(e) => setForm((s) => ({ ...s, openings: Number(e.target.value) }))}
                required
              />
              <button className="w-full inline-flex items-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium">
                <Plus className="h-4 w-4" /> Create
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-3xl md:col-span-2 ${glass}`}
          >
            <div className="font-semibold mb-3">Open Roles</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {loading ? (
                <div className="h-24 rounded-xl bg-gray-200/60 animate-pulse" />
              ) : (
                jobs.map((j) => (
                  <div key={j._id} className="p-4 rounded-2xl border bg-white/70">
                    <div className="font-medium">{j.title}</div>
                    <div className="text-sm text-gray-600">{j.location}</div>
                    <div className="mt-2 text-xs inline-flex items-center gap-1 text-gray-700">
                      <Users className="h-3.5 w-3.5" /> Openings: {j.openings}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
