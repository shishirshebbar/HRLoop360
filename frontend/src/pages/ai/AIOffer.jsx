import { useState } from "react";
import { apiPost } from "../../lib/api";

const SAMPLE = {
  candidateId: "C-104",
  offeredBaseSalary: 90000,
  marketMedianSalary: 95000,
  roleLevel: "mid",             // junior|mid|senior
  experienceYears: 5,
  benefitsScore: 0.6,           // 0..1
  locationFlexibility: 1,       // 0=on-site, 1=remote
  offerSpeedDays: 4,
  companyReputationScore: 0.85  // 0..1
};

export default function AIOffer() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  async function submit(e) {
    e.preventDefault();
    setErr(""); setRes(null); setLoading(true);
    try {
      const out = await apiPost("/api/ai/offer", form);
      setRes(out?.data || null);
    } catch (e) { setErr(e.message || "Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Offer Acceptance Optimizer</h1>
        <p className="text-gray-600">Predict acceptance probability and what-if levers.</p>
      </header>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Candidate ID" value={form.candidateId} onChange={v => set("candidateId", v)} />
          <Number label="Offered Base Salary" value={form.offeredBaseSalary} onChange={v => set("offeredBaseSalary", v)} />
          <Number label="Market Median Salary" value={form.marketMedianSalary} onChange={v => set("marketMedianSalary", v)} />
          <Select label="Role Level" value={form.roleLevel} onChange={v => set("roleLevel", v)} options={["junior","mid","senior"]}/>
          <Number label="Experience (years)" value={form.experienceYears} onChange={v => set("experienceYears", v)} />
          <Number label="Benefits Score (0..1)" value={form.benefitsScore} step="0.01" onChange={v => set("benefitsScore", v)} />
          <Number label="Location Flex (0 on-site..1 remote)" value={form.locationFlexibility} step="0.1" onChange={v => set("locationFlexibility", v)} />
          <Number label="Offer Speed (days)" value={form.offerSpeedDays} onChange={v => set("offerSpeedDays", v)} />
          <Number label="Company Reputation (0..1)" value={form.companyReputationScore} step="0.01" onChange={v => set("companyReputationScore", v)} />
        </div>

        <div className="flex gap-3">
          <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setForm(SAMPLE)}>Use Sample Data</button>
          <button className="rounded-xl bg-black text-white px-4 py-2" disabled={loading}>{loading ? "Scoring..." : "Optimize"}</button>
        </div>
      </form>

      {err && <div className="text-red-600">{err}</div>}
      {res && (
        <div className="space-y-4">
          <Card title="Result">
            <div className="flex flex-wrap items-center gap-4">
              <Badge tone={res.acceptanceProbability > 0.75 ? "green" : res.acceptanceProbability > 0.5 ? "amber" : "red"}>
                Acceptance Probability: {(res.acceptanceProbability * 100).toFixed(1)}%
              </Badge>
              <Badge tone={res.riskLevel === "low" ? "green" : res.riskLevel === "medium" ? "amber" : "red"}>
                Risk: {res.riskLevel}
              </Badge>
            </div>
          </Card>
          <Card title="Key Factors">
            <ul className="list-disc ml-5">
              {res.keyFactors?.map((f,i)=>(
                <li key={i}>{f.factor} — <span className={f.impact==="positive"?"text-green-700":"text-red-700"}>{f.impact}</span></li>
              ))}
            </ul>
          </Card>
          <Card title="Recommendations">
            <ul className="list-disc ml-5">{res.recommendations?.map((a,i)=><li key={i}>{a}</li>)}</ul>
          </Card>
          {res.explanation && <Card title="Explanation"><p className="whitespace-pre-wrap">{res.explanation}</p></Card>}
        </div>
      )}
    </div>
  );
}

function Input(props){ return <LabeledInput type="text" {...props} />; }
function Number(props){ return <LabeledInput type="number" {...props} />; }
function Select({ label, value, onChange, options }) {
  return <label className="block text-sm">{label}
    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={value} onChange={e=>onChange(e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </label>;
}
function LabeledInput({ label, type="text", value, onChange, step }) {
  return <label className="block text-sm">{label}
    <input type={type} step={step} className="mt-1 w-full rounded-xl border px-3 py-2"
      value={value} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)} />
  </label>;
}
function Card({ title, children }) {
  return <div className="rounded-2xl border p-4"><h3 className="font-semibold mb-2">{title}</h3>{children}</div>;
}
function Badge({ children, tone="gray" }) {
  const t = { gray:"bg-gray-100 text-gray-800", green:"bg-green-100 text-green-800", amber:"bg-amber-100 text-amber-800", red:"bg-red-100 text-red-800" }[tone];
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${t}`}>{children}</span>;
}
