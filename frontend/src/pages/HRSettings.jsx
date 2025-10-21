import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Shield, Bell, Upload } from "lucide-react";

const glass = "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function HRSettings() {
  const [notify, setNotify] = useState(true);
  const [autoShortlist, setAutoShortlist] = useState(false);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">HR Settings</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-3xl ${glass}`}>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-indigo-600" />
              <div className="font-semibold">AI Screening</div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl border bg-white/70 cursor-pointer">
              <span className="text-sm text-gray-700">Auto-shortlist above fit score ≥ 80</span>
              <input type="checkbox" checked={autoShortlist} onChange={() => setAutoShortlist((s) => !s)} />
            </label>

            <div className="mt-3 text-xs text-gray-500">
              Uses your AI resume screener to pre-approve candidates who exceed the threshold.
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-3xl ${glass}`}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-indigo-600" />
              <div className="font-semibold">Notifications</div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl border bg-white/70 cursor-pointer">
              <span className="text-sm text-gray-700">Email me when a candidate advances stage</span>
              <input type="checkbox" checked={notify} onChange={() => setNotify((s) => !s)} />
            </label>

            <div className="mt-3 text-xs text-gray-500">
              We’ll send activity digests and critical updates to your work email.
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-3xl md:col-span-2 ${glass}`}>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="h-5 w-5 text-indigo-600" />
              <div className="font-semibold">Bulk Upload Candidates</div>
            </div>

            <div className="p-4 rounded-xl border bg-white/70">
              <input type="file" className="block w-full text-sm" accept=".csv" />
              <div className="text-xs text-gray-500 mt-2">
                Upload a CSV with columns: <code>name, email, jobId</code>. Parsing hooks into the AI Resume Screener.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
