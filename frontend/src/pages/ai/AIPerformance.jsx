import { useState } from "react";
import { apiPost } from "../../lib/api";

const SAMPLE = {
  employeeId: "EMP-1024",
  okrCompletion: 0.58,
  attendanceRate: 0.92,
  peerFeedbackCount: 6,
  peerFeedbackSentiment: 0.1, // -1..1
  lastManagerRating: 3.0,     // 1..5
  tenureMonths: 8,
  roleComplexity: "medium"    // low|medium|high
};

export default function AIPerformance() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  async function submit(e) {
    e.preventDefault();
    setErr(""); setRes(null); setLoading(true);
    try {
      const out = await apiPost("/api/ai/performance", form);
      setRes(out?.data || null);
    } catch (e) {
      setErr(e.message || "Request failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Performance Prediction</h1>
        <p className="text-gray-600">Score, risk, drivers, and recommended actions.</p>
      </header>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Employee ID" value={form.employeeId} onChange={v => set("employeeId", v)} />
          <Number label="OKR Completion (0-1)" value={form.okrCompletion} onChange={v => set("okrCompletion", v)} step="0.01"/>
          <Number label="Attendance Rate (0-1)" value={form.attendanceRate} onChange={v => set("attendanceRate", v)} step="0.01"/>
          <Number label="Peer Feedback Count" value={form.peerFeedbackCount} onChange={v => set("peerFeedbackCount", v)} />
          <Number label="Peer Feedback Sentiment (-1..1)" value={form.peerFeedbackSentiment} onChange={v => set("peerFeedbackSentiment", v)} step="0.01"/>
          <Number label="Last Manager Rating (1..5)" value={form.lastManagerRating} onChange={v => set("lastManagerRating", v)} step="0.1"/>
          <Number label="Tenure (months)" value={form.tenureMonths} onChange={v => set("tenureMonths", v)} />
          <Select label="Role Complexity" value={form.roleComplexity} onChange={v => set("roleComplexity", v)} options={["low","medium","high"]}/>
        </div>

        <div className="flex gap-3">
          <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setForm(SAMPLE)}>Use Sample Data</button>
          <button className="rounded-xl bg-black text-white px-4 py-2" disabled={loading}>{loading ? "Scoring..." : "Score"}</button>
        </div>
      </form>

      {err && <div className="text-red-600">{err}</div>}
      {res && (
        <div className="space-y-4">
          <Card title="Result">
            <div className="flex flex-wrap items-center gap-4">
              <Badge>Score: {res.score}</Badge>
              <Badge tone={res.risk === "low" ? "green" : res.risk === "medium" ? "amber" : "red"}>Risk: {res.risk}</Badge>
            </div>
          </Card>
          <Card title="Top Drivers">
            <ul className="list-disc ml-5">
              {res.topDrivers?.map((d, i) => (
                <li key={i}>{d.feature} — <span className={d.impact === "positive" ? "text-green-700" : "text-red-700"}>{d.impact}</span></li>
              ))}
            </ul>
          </Card>
          <Card title="Recommended Actions">
            <ul className="list-disc ml-5">{res.actions?.map((a,i)=><li key={i}>{a}</li>)}</ul>
          </Card>
          {res.explanation && <Card title="Explanation"><p className="whitespace-pre-wrap">{res.explanation}</p></Card>}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return <label className="block text-sm">{label}
    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} />
  </label>;
}
function Number({ label, value, onChange, step="1" }) {
  return <label className="block text-sm">{label}
    <input type="number" step={step} className="mt-1 w-full rounded-xl border px-3 py-2"
      value={value} onChange={e=>onChange(Number(e.target.value))} />
  </label>;
}
function Select({ label, value, onChange, options }) {
  return <label className="block text-sm">{label}
    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={value} onChange={e=>onChange(e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </label>;
}
function Card({ title, children }) {
  return <div className="rounded-2xl border p-4"><h3 className="font-semibold mb-2">{title}</h3>{children}</div>;
}
function Badge({ children, tone="gray" }) {
  const t = {
    gray: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${t}`}>{children}</span>;
}
