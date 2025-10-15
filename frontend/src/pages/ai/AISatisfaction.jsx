import { useState } from "react";
import { apiPost } from "../../lib/api";

const SAMPLE = {
  teamId: "TEAM-42",
  windowLabel: "last_4_weeks",
  surveys: [
    { employeeId: "E1", items: { workload: 3, recognition: 4, growth: 4, managerSupport: 5 }, comment: "Good support and fair workload. Happy with the pace." },
    { employeeId: "E2", items: { workload: 2, recognition: 3, growth: 3, managerSupport: 3 }, comment: "Feeling a bit overloaded and under-recognized." },
    { employeeId: "E3", items: { workload: 4, recognition: 4, growth: 5, managerSupport: 4 }, comment: "Great growth opportunities and flexible schedule." }
  ]
};

export default function AISatisfaction() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function setSurvey(i, key, value) {
    setForm(p => {
      const s = [...p.surveys];
      s[i] = { ...s[i], [key]: value };
      return { ...p, surveys: s };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setRes(null); setLoading(true);
    try {
      const out = await apiPost("/api/ai/satisfaction", form);
      setRes(out?.data || null);
    } catch (e) { setErr(e.message || "Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Employee Satisfaction Prediction</h1>
        <p className="text-gray-600">Blend pulse survey + sentiment → team score, heatmap, actions.</p>
      </header>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Team ID" value={form.teamId} onChange={v => setForm(p => ({ ...p, teamId: v }))} />
          <Input label="Window Label" value={form.windowLabel} onChange={v => setForm(p => ({ ...p, windowLabel: v }))} />
        </div>

        <div className="space-y-3">
          <div className="font-semibold">Surveys</div>
          {form.surveys.map((s, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <Input label="Employee ID" value={s.employeeId} onChange={v => setSurvey(i, "employeeId", v)} />
                <Number label="Workload (1..5)" value={s.items.workload} onChange={v => setSurvey(i, "items", { ...s.items, workload: v })} />
                <Number label="Recognition (1..5)" value={s.items.recognition} onChange={v => setSurvey(i, "items", { ...s.items, recognition: v })} />
                <Number label="Growth (1..5)" value={s.items.growth} onChange={v => setSurvey(i, "items", { ...s.items, growth: v })} />
                <Number label="Mgr Support (1..5)" value={s.items.managerSupport} onChange={v => setSurvey(i, "items", { ...s.items, managerSupport: v })} />
                <Input label="Comment" value={s.comment} onChange={v => setSurvey(i, "comment", v)} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setForm(SAMPLE)}>Use Sample Data</button>
          <button className="rounded-xl bg-black text-white px-4 py-2" disabled={loading}>{loading ? "Scoring..." : "Score"}</button>
        </div>
      </form>

      {err && <div className="text-red-600">{err}</div>}
      {res && (
        <div className="space-y-4">
          <Card title="Team Result">
            <div className="flex flex-wrap items-center gap-4">
              <Badge>Team Score: {res.teamScore}</Badge>
              <Badge tone={res.risk === "low" ? "green" : res.risk === "medium" ? "amber" : "red"}>Risk: {res.risk}</Badge>
            </div>
          </Card>

          <Card title="Heatmap">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {res.heatmap?.map((h,i)=>(
                <Bar key={i} label={h.dimension} value={h.score} />
              ))}
            </div>
          </Card>

          <Card title="People">
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
                  {res.people?.map((p,i)=>(
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{p.employeeId}</td>
                      <td className="py-2 pr-4">{p.score}</td>
                      <td className="py-2 pr-4">{p.sentiment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Actions">
            <ul className="list-disc ml-5">{res.actions?.map((a,i)=><li key={i}>{a}</li>)}</ul>
          </Card>

          {res.explanation && <Card title="Overview"><p className="whitespace-pre-wrap">{res.explanation}</p></Card>}
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
function Number({ label, value, onChange }) {
  return <label className="block text-sm">{label}
    <input type="number" min={1} max={5} className="mt-1 w-full rounded-xl border px-3 py-2"
      value={value} onChange={e=>onChange(Number(e.target.value))} />
  </label>;
}
function Card({ title, children }) {
  return <div className="rounded-2xl border p-4"><h3 className="font-semibold mb-2">{title}</h3>{children}</div>;
}
function Badge({ children, tone="gray" }) {
  const t = { gray:"bg-gray-100 text-gray-800", green:"bg-green-100 text-green-800", amber:"bg-amber-100 text-amber-800", red:"bg-red-100 text-red-800" }[tone];
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${t}`}>{children}</span>;
}
function Bar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-500">{value}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-xl overflow-hidden">
        <div className="h-3 bg-black" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
