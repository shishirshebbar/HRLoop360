
const { generateExplanation } = require("./provider");

const WEIGHTS = {
  okrCompletion: 0.32,
  attendanceRate: 0.18,
  peerFeedbackCount: 0.08,
  peerFeedbackSentiment: 0.14,
  lastManagerRating: 0.22,
  tenureMonths: 0.06,
};

const NORMALIZERS = {
  peerFeedbackCountCap: 10,
  tenureSaturation: 24,
};

function scorePerformance(input) {
  const {
    okrCompletion,
    attendanceRate,
    peerFeedbackCount,
    peerFeedbackSentiment, // -1..1
    lastManagerRating,     // 1..5
    tenureMonths,
    roleComplexity,        // low|medium|high
  } = input;

  const fbCountNorm = Math.min(peerFeedbackCount, NORMALIZERS.peerFeedbackCountCap) / NORMALIZERS.peerFeedbackCountCap;
  const ratingNorm = (lastManagerRating - 1) / 4;
  const tenureNorm = Math.min(tenureMonths / NORMALIZERS.tenureSaturation, 1);
  const complexityFactor = roleComplexity === "high" ? 0.95 : roleComplexity === "low" ? 1.03 : 1.0;

  const raw =
    okrCompletion * WEIGHTS.okrCompletion +
    attendanceRate * WEIGHTS.attendanceRate +
    fbCountNorm * WEIGHTS.peerFeedbackCount +
    ((peerFeedbackSentiment + 1) / 2) * WEIGHTS.peerFeedbackSentiment +
    ratingNorm * WEIGHTS.lastManagerRating +
    tenureNorm * WEIGHTS.tenureMonths;

  const score01 = Math.max(0, Math.min(1, raw * complexityFactor));
  const score = Math.round(score01 * 100);
  const risk = score >= 80 ? "low" : score >= 60 ? "medium" : "high";

  const mids = { okr: 0.6, att: 0.9, fb: 0.3, sent: 0, rate: 0.5, ten: 0.5 };
  const contribs = [
    { feature: "OKR Completion", delta: WEIGHTS.okrCompletion * (okrCompletion - mids.okr) },
    { feature: "Attendance Rate", delta: WEIGHTS.attendanceRate * (attendanceRate - mids.att) },
    { feature: "Peer Feedback Volume", delta: WEIGHTS.peerFeedbackCount * (fbCountNorm - mids.fb) },
    { feature: "Peer Feedback Sentiment", delta: WEIGHTS.peerFeedbackSentiment * (peerFeedbackSentiment - mids.sent) / 2 },
    { feature: "Last Manager Rating", delta: WEIGHTS.lastManagerRating * (ratingNorm - mids.rate) },
    { feature: "Tenure", delta: WEIGHTS.tenureMonths * (tenureNorm - mids.ten) },
    { feature: "Role Complexity Adj.", delta: (complexityFactor - 1) * raw }
  ].sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));

  const topDrivers = contribs.slice(0,3).map(d => ({
    feature: d.feature,
    impact: d.delta >= 0 ? "positive" : "negative",
    magnitude: Math.abs(Number(d.delta.toFixed(3))),
  }));

  const actions = [];
  if (okrCompletion < 0.6) actions.push("Define 2–3 short-cycle OKRs with weekly check-ins.");
  if (attendanceRate < 0.9) actions.push("Address attendance blockers; allow flexible hours for one sprint.");
  if (peerFeedbackSentiment < 0) actions.push("Schedule 1:1 coaching and peer pairing.");
  if ((lastManagerRating - 1) / 4 < 0.5) actions.push("Align expectations; set a 30-day improvement plan.");
  if (actions.length === 0) actions.push("Maintain momentum; consider stretch goals and mentorship.");

  return { score, risk, topDrivers, actions };
}

async function scoreAndExplain(input) {
  const data = scorePerformance(input);
  const explanation = await generateExplanation(`
You are an HR analyst. In 90–120 words, neutrally summarize the performance outlook.
Include 2 bullet recommendations.

Score: ${data.score}
Risk: ${data.risk}
Top Drivers: ${data.topDrivers.map(d => `${d.feature} (${d.impact})`).join(", ")}

Inputs:
${JSON.stringify(input)}
`.trim());
  return { ...data, explanation };
}

module.exports = { scoreAndExplain };
