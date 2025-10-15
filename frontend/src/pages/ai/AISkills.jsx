import { useState } from "react";
import { apiPost } from "../../lib/api";

const SAMPLE = {
  profileText:
    "Frontend engineer with 3 years using React, Next.js, JavaScript, TypeScript, Node.js, Express, MongoDB, TailwindCSS, Jest, and CI/CD. Comfortable with REST, GraphQL basics, Docker, and AWS. Experience mentoring juniors and running standups.",
  jobText:
    "Senior Frontend Engineer skilled in React, Next.js, TypeScript, GraphQL, performance optimization, testing with Jest/Cypress, CI/CD, accessibility, and design systems (MUI/Tailwind). Bonus: AWS, Docker, and Kubernetes.",
  topK: 6
};

export default function AISkills() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  async function submit(e) {
    e.preventDefault();
    setErr(""); setRes(null); setLoading(true);
    try {
      const out = await apiPost("/api/ai/skills", form);
      setRes(out?.data || null);
    } catch (e) { setErr(e.message || "Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Skill Gaps Analyzer</h1>
        <p className="text-gray-600">Compare profile vs JD, see strengths, gaps, and a learning plan.</p>
      </header>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea label="Profile Text" value={form.profileText} onChange={v => set("profileText", v)} />
          <TextArea label="Job Description" value={form.jobText} onChange={v => set("jobText", v)} />
        </div>
        <div className="w-40">
          <Number label="Top K (3..20)" value={form.topK} onChange={v => set("topK", v)} />
        </div>
        <div className="flex gap-3">
          <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setForm(SAMPLE)}>Use Sample Data</button>
          <button className="rounded-xl bg-black text-white px-4 py-2" disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>
        </div>
      </form>

      {err && <div className="text-red-600">{err}</div>}
      {res && (
        <div className="space-y-4">
          <Card title="Extracted Skills">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <List title="Profile skills" items={res.profileSkills} />
              <List title="Job skills" items={res.jobSkills} />
            </div>
          </Card>
          <Card title="Strengths">
            <ul className="list-disc ml-5">
              {res.strengths?.map((s,i)=>(
                <li key={i}>{s.skill} <span className="text-gray-500">({s.matchedWith}, sim {s.similarity})</span></li>
              ))}
            </ul>
          </Card>
          <Card title="Gaps">
            <ul className="list-disc ml-5">
              {res.gaps?.map((g,i)=>(<li key={i}>{g.skill} <span className="text-gray-500">(sim {g.similarity})</span></li>))}
            </ul>
          </Card>
          {res.explanation && <Card title="Learning Plan"><p className="whitespace-pre-wrap">{res.explanation}</p></Card>}
        </div>
      )}
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return <label className="block text-sm">{label}
    <textarea rows={10} className="mt-1 w-full rounded-xl border px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} />
  </label>;
}
function Number({ label, value, onChange }) {
  return <label className="block text-sm">{label}
    <input type="number" min={3} max={20} className="mt-1 w-full rounded-xl border px-3 py-2"
      value={value} onChange={e=>onChange(Number(e.target.value))} />
  </label>;
}
function Card({ title, children }) {
  return <div className="rounded-2xl border p-4"><h3 className="font-semibold mb-2">{title}</h3>{children}</div>;
}
function List({ title, items=[] }) {
  return (
    <div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((x,i)=><span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm">{x}</span>)}
      </div>
    </div>
  );
}
