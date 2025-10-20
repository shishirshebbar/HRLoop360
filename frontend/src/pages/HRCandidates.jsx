import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mail, Briefcase, Filter } from "lucide-react";

const glass = "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function HRCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [role, setRole] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    async function fetchAll() {
      setLoading(true);
      try {
        const [candRes, jobRes] = await Promise.all([
          axios.get("http://localhost:5000/api/hr/candidates", { headers }),
          axios.get("http://localhost:5000/api/hr/jobs", { headers }),
        ]);
        setCandidates(candRes.data || []);
        setJobs(jobRes.data || []);
      } catch {
        // Mock
        const mockJobs = [{ _id: "j1", title: "Frontend Engineer" }, { _id: "j2", title: "HR Executive" }];
        setJobs(mockJobs);
        setCandidates([
          { _id: "c1", name: "Ava Patel", email: "ava@ex.com", stage: "Screening", jobId: "j1" },
          { _id: "c2", name: "Rohit Kumar", email: "rk@ex.com", stage: "Interview", jobId: "j1" },
          { _id: "c3", name: "Mia Chen", email: "mia@ex.com", stage: "Applied", jobId: "j2" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    let data = candidates;
    if (role !== "All") data = data.filter((c) => c.stage === role);
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }, [candidates, role, query]);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Candidates</h1>
          <div className="text-sm text-gray-600">{filtered.length} results</div>
        </div>

        <div className={`p-5 rounded-3xl ${glass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {["All", "Applied", "Screening", "Interview", "Offer", "Hired"].map((t) => (
                <button
                  key={t}
                  onClick={() => setRole(t)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    role === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white/70 border-white/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search name or email..."
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
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Job</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Stage</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6">
                        <div className="h-6 w-full animate-pulse rounded bg-gray-200/70" />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <motion.tr
                        key={c._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-white/60"
                      >
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" /> {c.email}
                        </td>
                        <td className="px-4 py-3">
                          {jobs.find((j) => j._id === c.jobId)?.title || "—"}
                        </td>
                        <td className="px-4 py-3">{c.stage}</td>
                      </motion.tr>
                    ))
                  )}
                  {!loading && !filtered.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
