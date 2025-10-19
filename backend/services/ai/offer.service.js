
const { generateExplanation } = require("./provider");

function scoreOffer(input) {
  const {
    offeredBaseSalary,
    marketMedianSalary,
    roleLevel,               // junior|mid|senior
    experienceYears,
    benefitsScore,           // 0..1
    locationFlexibility,     // 0 on-site, 1 remote
    offerSpeedDays,
    companyReputationScore,  // 0..1
  } = input;

  const salaryRatio = offeredBaseSalary / marketMedianSalary;
  const salaryScore = Math.min(salaryRatio, 1.1);
  const speedScore = Math.max(0, 1 - offerSpeedDays / 14);

  let base =
    0.4 * salaryScore +
    0.15 * benefitsScore +
    0.1 * locationFlexibility +
    0.15 * speedScore +
    0.2 * companyReputationScore;

  if (roleLevel === "junior") base += 0.05;
  if (roleLevel === "senior") base -= 0.05;

  const acceptanceProbability = Math.min(Math.max(base, 0), 1);
  const riskLevel = acceptanceProbability > 0.75 ? "low" : acceptanceProbability > 0.5 ? "medium" : "high";

  const keyFactors = [];
  if (salaryRatio < 0.9) keyFactors.push({ factor: "Base salary below market", impact: "negative" });
  if (benefitsScore < 0.5) keyFactors.push({ factor: "Weak benefits", impact: "negative" });
  if (locationFlexibility > 0.5) keyFactors.push({ factor: "Remote flexibility", impact: "positive" });
  if (speedScore > 0.7) keyFactors.push({ factor: "Fast offer turnaround", impact: "positive" });
  if (companyReputationScore > 0.8) keyFactors.push({ factor: "Strong company reputation", impact: "positive" });

  const recommendations = [];
  if (salaryRatio < 0.9) recommendations.push("Increase base salary by 5–10%.");
  if (benefitsScore < 0.5) recommendations.push("Add signing bonus or enhance benefits.");
  if (offerSpeedDays > 7) recommendations.push("Shorten the internal approval cycle.");
  if (recommendations.length === 0) recommendations.push("Proceed with current offer; likelihood high.");

  return { acceptanceProbability, riskLevel, keyFactors, recommendations };
}

async function scoreAndExplain(input) {
  const data = scoreOffer(input);
  const explanation = await generateExplanation(`
You are a recruiting analyst. Provide a ~100-word summary explaining the predicted offer acceptance,
and list two targeted suggestions to improve it. Be neutral.

Probability: ${(data.acceptanceProbability * 100).toFixed(1)}%
Risk: ${data.riskLevel}
Key Factors: ${data.keyFactors.map(f => `${f.factor} (${f.impact})`).join(", ")}
Recommendations: ${data.recommendations.join("; ")}

Inputs: ${JSON.stringify(input)}
`.trim());
  return { ...data, explanation };
}

module.exports = { scoreAndExplain };
