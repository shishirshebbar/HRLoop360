import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiPost } from "../../lib/api";
import {
  Users,
  Sparkles,
  ClipboardList,
  BarChart3,
  Gauge,
  Smile,
  Frown,
  Meh,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const SAMPLE = {
  teamId: "TEAM-42",
  windowLabel: "last_4_weeks",
  surveys: [
    {
      employeeId: "E1",
      items: { workload: 3, recognition: 4, growth: 4, managerSupport: 5 },
      comment: "Good support and fair workload. Happy with the pace.",
    },
    {
      employeeId: "E2",
      items: { workload: 2, recognition: 3, growth: 3, managerSupport: 3 },
      comment: "Feeling a bit overloaded and under-recognized.",
    },
    {
      employeeId: "E3",
      items: { workload: 4, recognition: 4, growth: 5, managerSupport: 4 },
      comment: "Great growth opportunities and flexible schedule.",
    },
  ],
};

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function AISatisfaction() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  function setSurvey(idx, updater) {
    setForm((p) => {
      const surveys = p.surveys.slice();
      surveys[idx] = updater(surveys[idx]);
      return { ...p, surveys };
    });
  }
  function addSurvey() {
    setForm((p) => ({
      ...p,
      surveys: [
        ...p.surveys,
        {
          employeeId: "",
          items: { workload: 3, recognition: 3, growth: 3, managerSupport: 3 },
          comment: "",
        },
      ],
    }));
  }
  function removeSurvey(idx) {
    setForm((p) => ({
      ...p,
      surveys: p.surveys.filter((_, i) => i !== idx),
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setRes(null);
    setLoading(true);
    try {
      const out = await apiPost("/api/ai/satisfaction", form);
      const data = out?.data?.data ?? out?.data ?? out;
      setRes(data || null);
    } catch (e) {
      setErr(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  // Derived counts for header chips
  const totals = useMemo(
    () => ({
      people: form.surveys?.length || 0,
      window: form.windowLabel || "",
    }),
    [form.surveys, form.windowLabel]
  );

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
              Employee Satisfaction Prediction
            </motion.h1>
            <p className="text-gray-600">
              Blend pulse survey & sentiment → team score, heatmap, actions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI powered
          </div>
        </div>

        {/* Grid: Left form / Right results */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`lg:col-span-3 p-6 rounded-3xl ${glass}`}
          >
            {/* Form header */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Inputs</h2>
                  <p className="text-sm text-gray-600">
                    Team window & pulse survey items (1..5)
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-indigo-600" />
                {totals.people} responses
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Team ID"
                value={form.teamId}
                onChange={(v) => setField("teamId", v)}
              />
              <Input
                label="Window Label"
                value={form.windowLabel}
                onChange={(v) => setField("windowLabel", v)}
              />
            </div>

            {/* Surveys */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Surveys</div>
                <button
                  type="button"
                  onClick={addSurvey}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:border-indigo-400"
                >
                  <Plus className="h-4 w-4" /> Add survey
                </button>
              </div>

              {form.surveys.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border bg-white/70 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      Response #{i + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSurvey(i)}
                      className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                      title="Remove survey"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

                    <Input
  label="Employee ID"
  value={s.employeeId}
  onChange={(v) => setSurvey(i, (prev) => ({ ...prev, employeeId: v }))}
  // Employee ID wider so it doesn’t collide
  className="md:col-span-3"
/>

<Slider1to5
  label="Workload"
  value={s.items.workload}
  onChange={(v) =>
    setSurvey(i, (prev) => ({
      ...prev,
      items: { ...prev.items, workload: v },
    }))
  }
  className="md:col-span-2"
/>

<Slider1to5
  label="Recognition"
  value={s.items.recognition}
  onChange={(v) =>
    setSurvey(i, (prev) => ({
      ...prev,
      items: { ...prev.items, recognition: v },
    }))
  }
  className="md:col-span-2"
/>

<Slider1to5
  label="Growth"
  value={s.items.growth}
  onChange={(v) =>
    setSurvey(i, (prev) => ({
      ...prev,
      items: { ...prev.items, growth: v },
    }))
  }
  className="md:col-span-2"
/>

<Slider1to5
  label="Manager Support"
  value={s.items.managerSupport}
  onChange={(v) =>
    setSurvey(i, (prev) => ({
      ...prev,
      items: { ...prev.items, managerSupport: v },
    }))
  }
  className="md:col-span-3"
/>

<Textarea
  label="Comment"
  value={s.comment}
  onChange={(v) => setSurvey(i, (prev) => ({ ...prev, comment: v }))}
  // Let comments wrap below everything
  className="md:col-span-12"
/>

                  </div>
                </motion.div>
              ))}
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
                type="submit"
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

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={`lg:col-span-2 p-6 rounded-3xl ${glass}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white grid place-items-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Team Result</h2>
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
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Top chips */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <div className="text-sm text-gray-600 mb-2">
                        Team Score
                      </div>
                      <BigStat
                        value={normalizePercent(res.teamScore)}
                        suffix="%"
                        tone={scoreTone(normalizePercent(res.teamScore))}
                      />
                      <Progress value={normalizePercent(res.teamScore)} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <div className="text-sm text-gray-600 mb-2">Risk</div>
                      <Badge
                        tone={
                          res.risk === "low"
                            ? "green"
                            : res.risk === "medium"
                            ? "amber"
                            : "red"
                        }
                      >
                        {res.risk || "unknown"}
                      </Badge>
                    </div>
                  </div>

                  {/* Heatmap */}
                  {Array.isArray(res.heatmap) && res.heatmap.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Gauge className="h-4 w-4" /> Heatmap
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {res.heatmap.map((h, i) => (
                          <HeatBar
                            key={i}
                            label={h.dimension}
                            value={normalizePercent(h.score)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* People table */}
                  {Array.isArray(res.people) && res.people.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2">People</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="py-2 pr-4">Employee</th>
                              <th className="py-2 pr-4">Score</th>
                              <th className="py-2 pr-4">Sentiment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {res.people.map((p, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-2 pr-4">{p.employeeId}</td>
                                <td className="py-2 pr-4">
                                  {normalizePercent(p.score)}%
                                </td>
                                <td className="py-2 pr-4">
                                  <SentimentBadge value={p.sentiment} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {Array.isArray(res.actions) && res.actions.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2">Actions</h3>
                      <ul className="list-disc ml-5 text-sm space-y-1">
                        {res.actions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Explanation */}
                  {res.explanation && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2">Overview</h3>
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {res.explanation}
                      </p>
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

/* -----------------
   Presentational UI
   ----------------- */

function Input({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm ${className}`}>
      {label}
      <input
        className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none min-w-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm ${className}`}>
      {label}
      <textarea
        rows={2}
        className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-y min-w-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}


function Slider1to5({ label, value, onChange, className = "" }) {
  // Allow free-typing in the box; slider stays numeric inside [1..5].
  const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
  const sliderValue = Number.isFinite ? (Number.isFinite(numeric) ? numeric : 3) : (isFinite(numeric) ? numeric : 3);

  return (
    <label className={`text-sm ${className}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0 truncate">{label}</span>
        <input
          type="text"
          inputMode="numeric"
          className="sm:ml-2 w-full sm:w-20 rounded-lg border px-2 py-1 text-right focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}  // keep text exactly as typed
          placeholder="1-5"
        />
      </div>

      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={Math.min(5, Math.max(1, sliderValue || 3))}
        onChange={(e) => onChange(Number(e.target.value))} // slider sends number
        className="mt-2 w-full"
      />
    </label>
  );
}


function Progress({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-indigo-600"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function BigStat({ value, suffix = "%", tone = "emerald" }) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "amber"
      ? "text-amber-600"
      : "text-red-600";
  return (
    <div className={`text-4xl font-extrabold ${toneClass}`}>
      {Number.isFinite?.(value) ? value : 0}
      {suffix}
    </div>
  );
}

function scoreTone(score) {
  const s = Number(score || 0);
  if (s >= 80) return "emerald";
  if (s >= 60) return "amber";
  return "red";
}

function normalizePercent(raw) {
  // Accept: 0..1, 0..100, "61", "61%", "0.61", "61/100"
  if (raw == null) return 0;
  let v = raw;
  if (typeof v === "string") {
    const m = v.match(/-?\d+(\.\d+)?/);
    if (!m) return 0;
    v = parseFloat(m[0]);
    if (/%/.test(raw) || /\/\s*100/.test(raw)) return Math.round(v);
  }
  if (typeof v !== "number" || isNaN(v)) return 0;
  if (v <= 1 && v >= -1) return Math.round(v * 100);
  return Math.round(v);
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

function HeatBar({ label, value }) {
  const tone =
    value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-xl overflow-hidden">
        <div className={`h-3 ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SentimentBadge({ value }) {
  // Expect -1..1 or a string like "0.3"
  const v = typeof value === "string" ? parseFloat(value) : Number(value || 0);
  const Icon = v > 0.2 ? Smile : v < -0.2 ? Frown : Meh;
  const tone =
    v > 0.2
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v < -0.2
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full border ${tone}`}>
      <Icon className="h-4 w-4" />
      {v.toFixed(2)}
    </span>
  );
}
