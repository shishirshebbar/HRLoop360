
const { sentimentScore, generateExplanation } = require("./provider");

// Very small fallback lexicon for sentiment when provider unavailable:
const POS = ["great","good","helpful","support","recognize","promote","happy","balanced","clear","fair","flexible"];
const NEG = ["bad","overload","stress","toxic","unfair","delay","blocked","confusing","unclear","burnout","underpaid","micromanage"];
function simpleSent(text = "") {
  const t = text.toLowerCase();
  const p = POS.reduce((a,w)=>a+(t.includes(w)?1:0),0);
  const n = NEG.reduce((a,w)=>a+(t.includes(w)?1:0),0);
  if (!p && !n) return 0;
  return Math.max(-1, Math.min(1, (p - n) / Math.max(1, p + n)));
}

async function scoreSatisfaction(payload) {
  const rows = await Promise.all(payload.surveys.map(async s => {
    const vals = Object.values(s.items || {});
    const likertAvg01 = vals.reduce((a,b)=>a+b,0) / (Math.max(vals.length,1) * 5);
    const g = await sentimentScore(s.comment);
    const sent = g ?? simpleSent(s.comment);
    const blended01 = Math.max(0, Math.min(1, 0.8 * likertAvg01 + 0.2 * ((sent + 1)/2)));
    return {
      employeeId: s.employeeId,
      score01: blended01,
      detail: {
        workload: s.items.workload,
        recognition: s.items.recognition,
        growth: s.items.growth,
        managerSupport: s.items.managerSupport,
        sentiment: sent
      }
    };
  }));

  const teamScore01 = rows.reduce((a,r)=>a+r.score01,0) / rows.length;
  const teamScore = Math.round(teamScore01 * 100);
  const risk = teamScore >= 80 ? "low" : teamScore >= 60 ? "medium" : "high";

  function dimAvg(key){
    return Math.round( (rows.reduce((a,r)=>a + (r.detail[key]||0)/5,0) / rows.length) * 100 );
  }
  const heatmap = [
    { dimension: "workload",        score: dimAvg("workload") },
    { dimension: "recognition",     score: dimAvg("recognition") },
    { dimension: "growth",          score: dimAvg("growth") },
    { dimension: "managerSupport",  score: dimAvg("managerSupport") },
  ].sort((a,b)=>a.score-b.score);

  const actions = [];
  if (heatmap[0].dimension === "workload" && heatmap[0].score < 70) actions.push("Rebalance workload; pause ad-hoc tasks for one sprint.");
  if (heatmap[0].dimension === "recognition" && heatmap[0].score < 70) actions.push("Introduce weekly recognition rituals; set manager kudos targets.");
  if (heatmap[0].dimension === "growth" && heatmap[0].score < 70) actions.push("Set two learning goals per person; block 2 hrs/week for learning.");
  if (heatmap[0].dimension === "managerSupport" && heatmap[0].score < 70) actions.push("Ensure bi-weekly 1:1s; publish support expectations.");
  if (actions.length === 0) actions.push("Maintain current practices; pilot a small morale initiative.");

  const explanation = await generateExplanation(`
You are an HR analyst. Write a 90–120 word overview of team satisfaction and list 2 focused next steps.
Avoid PII. Be neutral and specific.

TeamScore: ${teamScore}
Risk: ${risk}
Heatmap: ${JSON.stringify(heatmap)}
SampleRows(3): ${JSON.stringify(rows.slice(0,3))}
`.trim());

  return {
    teamId: payload.teamId,
    windowLabel: payload.windowLabel,
    teamScore,
    risk,
    heatmap,
    people: rows.map(r => ({
      employeeId: r.employeeId,
      score: Math.round(r.score01 * 100),
      sentiment: Number((r.detail.sentiment || 0).toFixed(2))
    })),
    actions,
    explanation
  };
}

module.exports = { scoreSatisfaction };
