import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiPost } from "../../lib/api";
import {
  Activity,
  Sparkles,
  Gauge,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  UserCircle2,
  Clock,
  RefreshCw,
  Layers,
} from "lucide-react";

const SAMPLE = {
  employeeId: "EMP-1024",
  okrCompletion: 0.58,
  attendanceRate: 0.92,
  peerFeedbackCount: 6,
  peerFeedbackSentiment: 0.1, // -1..1
  lastManagerRating: 3.0, // 1..5
  tenureMonths: 8,
  roleComplexity: "medium", // low|medium|high
};

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function AIPerformance() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  async function submit(e) {
    e.preventDefault();
    setErr("");
    setRes(null);
    setLoading(true);
    try {
      const out = await apiPost("/api/ai/performance", form);
      setRes(out?.data || null);
    } catch (e) {
      setErr(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

function toScore100(raw) {
  if (raw == null) return null;
  let s = raw;

  if (typeof s === "object" && s !== null && "value" in s) s = s.value;

  if (typeof s === "string") {

    const m = s.match(/-?\d+(\.\d+)?/);
    if (!m) return null;
    s = parseFloat(m[0]);
    if (/%/.test(raw)) return Math.round(s);

    if (/\/\s*100/.test(raw)) return Math.round(s);
  }

  // numeric now
 if (typeof s !== "number" || isNaN(s)) return null;

  // If API gives a 0–1 score, scale up; if already 0–100, just round.
  if (s <= 1 && s >= -1) return Math.round(s * 100);
  return Math.round(s);
}
  const score100 = useMemo(() => toScore100(res?.score), [res?.score]);
 const scoreTone = useMemo(() => {
  const s = score100 ?? 0;
  if (s >= 80) return "emerald";
  if (s >= 60) return "amber";
  return "red";
}, [score100]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold"
            >
              Performance Prediction
            </motion.h1>
            <p className="text-gray-600">Score, risk, drivers, and recommended actions.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI powered
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`lg:col-span-3 p-6 rounded-3xl ${glass}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Inputs</h2>
                <p className="text-sm text-gray-600">Performance, attendance & feedback signals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={<UserCircle2 className="h-4 w-4" />}
                label="Employee ID"
                value={form.employeeId}
                onChange={(v) => set("employeeId", v)}
              />

              <Slider
                label="OKR Completion"
                help="Completion ratio (0..1)"
                min={0}
                max={1}
                step={0.01}
                value={form.okrCompletion}
                onChange={(v) => set("okrCompletion", v)}
              />

              <Slider
                label="Attendance Rate"
                help="Consistency of presence (0..1)"
                min={0}
                max={1}
                step={0.01}
                value={form.attendanceRate}
                onChange={(v) => set("attendanceRate", v)}
              />

              <Number
                icon={<BarChart3 className="h-4 w-4" />}
                label="Peer Feedback Count"
                value={form.peerFeedbackCount}
                onChange={(v) => set("peerFeedbackCount", v)}
              />

              <Slider
                label="Peer Feedback Sentiment"
                help="Average sentiment (-1..1)"
                min={-1}
                max={1}
                step={0.01}
                value={form.peerFeedbackSentiment}
                onChange={(v) => set("peerFeedbackSentiment", v)}
              />

              <Number
                icon={<Gauge className="h-4 w-4" />}
                label="Last Manager Rating (1..5)"
                value={form.lastManagerRating}
                step={0.1}
                onChange={(v) => set("lastManagerRating", v)}
              />

              <Number
                icon={<Clock className="h-4 w-4" />}
                label="Tenure (months)"
                value={form.tenureMonths}
                onChange={(v) => set("tenureMonths", v)}
              />

              <Select
                label="Role Complexity"
                value={form.roleComplexity}
                onChange={(v) => set("roleComplexity", v)}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border px-4 py-2 hover:border-indigo-400"
                onClick={() => setForm(SAMPLE)}
              >
                Use Sample Data
              </button>
              <button
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 inline-flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Scoring...
                  </>
                ) : (
                  <>Score</>
                )}
              </button>
            </div>
          </motion.form>

          {/* Right: Result */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={`lg:col-span-2 p-6 rounded-3xl ${glass}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white grid place-items-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Result</h2>
                <p className="text-sm text-gray-600">Score, risk & insights</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!res && !err && !loading && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-600"
                >
                  Fill the inputs and hit <b>Score</b> to see results.
                </motion.div>
              )}

              {err && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm rounded-xl px-3 py-2 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" /> {err}
                </motion.div>
              )}

              {res && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <div className="text-sm text-gray-600 mb-2">Score</div>
                      <BigStat value={score100 ?? 0} suffix="/100" tone={scoreTone} />
<Progress value={score100 ?? 0} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <div className="text-sm text-gray-600 mb-2">Risk</div>
                      <Badge tone={res.risk === "low" ? "green" : res.risk === "medium" ? "amber" : "red"}>
                        {res.risk || "unknown"}
                      </Badge>
                    </div>
                  </div>

                  {Array.isArray(res.topDrivers) && res.topDrivers.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2 flex items-center gap-2"><Layers className="h-4 w-4"/> Top Drivers</h3>
                      <ul className="space-y-1 text-sm">
                        {res.topDrivers.map((d, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className={`h-4 w-4 ${d.impact === "positive" ? "text-emerald-600" : "text-red-600"}`} />
                            <span className="font-medium">{d.feature}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${d.impact === "positive" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                              {d.impact}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(res.actions) && res.actions.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2">Recommended Actions</h3>
                      <ul className="list-disc ml-5 text-sm space-y-1">
                        {res.actions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {res.explanation && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2">Explanation</h3>
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{res.explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// -----------------
// Presentational UI
// -----------------
function Input({ label, value, onChange, icon }) {
  return (
    <label className="text-sm">
      {label}
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        <input
          type="text"
          className="w-full px-3 py-2 pl-9 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function Number({ label, value, onChange, icon, step = 1 }) {
  return (
    <label className="text-sm">
      {label}
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        <input
          type="number"
          step={step}
          className="w-full px-3 py-2 pl-9 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm">
      {label}
      <select
        className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Slider({ label, help, min = 0, max = 1, step = 0.01, value, onChange }) {
  return (
    <label className="text-sm">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs text-gray-500">{value}</span>
      </div>
      {help && <div className="text-xs text-gray-500">{help}</div>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
    </label>
  );
}

function Progress({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
      <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${clamped}%` }} />
    </div>
  );
}

function BigStat({ value, suffix = "", tone = "emerald" }) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "amber"
      ? "text-amber-600"
      : "text-red-600";
  return <div className={`text-4xl font-extrabold ${toneClass}`}>{value}{suffix}</div>;
}

function Badge({ children, tone = "gray" }) {
  const t = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm border ${t}`}>
      {children}
    </span>
  );
}
