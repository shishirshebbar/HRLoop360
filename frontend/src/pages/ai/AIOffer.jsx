import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiPost } from "../../lib/api";
import {
  Coins,
  BarChart3,
  Gauge,
  Sparkles,
  Clock,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

const SAMPLE = {
  candidateId: "C-104",
  offeredBaseSalary: 90000,
  marketMedianSalary: 95000,
  roleLevel: "mid", // junior|mid|senior
  experienceYears: 5,
  benefitsScore: 0.6, // 0..1
  locationFlexibility: 1, // 0=on-site, 1=remote
  offerSpeedDays: 4,
  companyReputationScore: 0.85, // 0..1
};

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function AIOffer() {
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
      const out = await apiPost("/api/ai/offer", form);
      setRes(out?.data || null);
    } catch (e) {
      setErr(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const pctToMarket = useMemo(() => {
    const { offeredBaseSalary, marketMedianSalary } = form;
    if (!marketMedianSalary) return 0;
    return Math.round(((offeredBaseSalary - marketMedianSalary) / marketMedianSalary) * 100);
  }, [form.offeredBaseSalary, form.marketMedianSalary]);

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
              Offer Acceptance Optimizer
            </motion.h1>
            <p className="text-gray-600">Predict acceptance probability and tune what‑if levers.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI powered
          </div>
        </div>

        {/* Grid */}
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
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Inputs</h2>
                <p className="text-sm text-gray-600">Candidate, compensation and offer context</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={<Briefcase className="h-4 w-4" />}
                label="Candidate ID"
                value={form.candidateId}
                onChange={(v) => set("candidateId", v)}
              />
              <Select
                label="Role Level"
                value={form.roleLevel}
                onChange={(v) => set("roleLevel", v)}
                options={[
                  { value: "junior", label: "Junior" },
                  { value: "mid", label: "Mid" },
                  { value: "senior", label: "Senior" },
                ]}
              />

              <Number
                icon={<Coins className="h-4 w-4" />}
                label="Offered Base Salary"
                prefix="$"
                value={form.offeredBaseSalary}
                onChange={(v) => set("offeredBaseSalary", v)}
              />
              <Number
                icon={<BarChart3 className="h-4 w-4" />}
                label="Market Median Salary"
                prefix="$"
                value={form.marketMedianSalary}
                onChange={(v) => set("marketMedianSalary", v)}
              />

              <Number
                icon={<Building2 className="h-4 w-4" />}
                label="Experience (years)"
                value={form.experienceYears}
                onChange={(v) => set("experienceYears", v)}
              />

              <Slider
                label="Benefits Score"
                help="Overall benefits competitiveness (0..1)"
                min={0}
                max={1}
                step={0.01}
                value={form.benefitsScore}
                onChange={(v) => set("benefitsScore", v)}
              />
              <Slider
                label="Location Flexibility"
                help="0 = on‑site, 1 = remote"
                min={0}
                max={1}
                step={0.1}
                value={form.locationFlexibility}
                onChange={(v) => set("locationFlexibility", v)}
              />
              <Number
                icon={<Clock className="h-4 w-4" />}
                label="Offer Speed (days)"
                value={form.offerSpeedDays}
                onChange={(v) => set("offerSpeedDays", v)}
              />
              <Slider
                label="Company Reputation"
                help="External brand & reviews (0..1)"
                min={0}
                max={1}
                step={0.01}
                value={form.companyReputationScore}
                onChange={(v) => set("companyReputationScore", v)}
              />
            </div>

            {/* Market comparison chip */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="px-2.5 py-1 rounded-full bg-white/70 border border-white/60">
                Offered vs market: <b>{pctToMarket}%</b>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/70 border border-white/60">
                Level: <b className="capitalize">{form.roleLevel}</b>
              </span>
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
                  <>
                    Optimize
                  </>
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
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Result</h2>
                <p className="text-sm text-gray-600">Probability, risk and recommendations</p>
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
                  Fill the inputs and hit <b>Optimize</b> to see results.
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
                      <div className="text-sm text-gray-600 mb-2">Acceptance Probability</div>
                      <BigStat value={Math.round((res.acceptanceProbability || 0) * 100)} suffix="%" tone="emerald" />
                      <Progress value={(res.acceptanceProbability || 0) * 100} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <div className="text-sm text-gray-600 mb-2">Risk Level</div>
                      <Badge tone={res.riskLevel === "low" ? "green" : res.riskLevel === "medium" ? "amber" : "red"}>
                        {res.riskLevel || "unknown"}
                      </Badge>
                    </div>
                  </div>

                  {Array.isArray(res.keyFactors) && res.keyFactors.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2 flex items-center gap-2"><BarChart3 className="h-4 w-4"/> Key Factors</h3>
                      <ul className="space-y-1 text-sm">
                        {res.keyFactors.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className={`h-4 w-4 ${f.impact === "positive" ? "text-emerald-600" : "text-red-600"}`} />
                            <span className="font-medium">{f.factor}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${f.impact === "positive" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                              {f.impact}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(res.recommendations) && res.recommendations.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <ul className="list-disc ml-5 text-sm space-y-1">
                        {res.recommendations.map((a, i) => (
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

function Number({ label, value, onChange, icon, prefix }) {
  return (
    <label className="text-sm">
      {label}
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        {prefix && <span className="absolute left-9 top-2.5 text-gray-500">{prefix}</span>}
        <input
          type="number"
          className={`w-full px-3 py-2 ${prefix ? "pl-14" : "pl-9"} rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none`}
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
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-emerald-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
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
      : "text-gray-700";
  return (
    <div className={`text-4xl font-extrabold ${toneClass}`}>{value}{suffix}</div>
  );
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
