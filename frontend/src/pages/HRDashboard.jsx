import FeatureCard from "../components/FeatureCard";
import Navbar from "../components/Navbar";

export default function HRDashboard() {
  return (
    <div className="h-screen bg-gray-100">
      <Navbar />
      
       <section>
        <h2 className="text-xl font-semibold mb-3">AI Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            title="Performance Prediction"
            description="Score, risk, key drivers, and actionable coaching tips."
            to="/ai/performance"
          />
          <FeatureCard
            title="Offer Acceptance Optimizer"
            description="Predict acceptance probability and get what-if levers."
            to="/ai/offer"
          />
          <FeatureCard
            title="Skill Gaps Analyzer"
            description="Compare profile vs JD, see strengths, gaps, and plan."
            to="/ai/skills"
          />
          <FeatureCard
            title="Satisfaction Prediction"
            description="Pulse survey blend, team score, heatmap, actions."
            to="/ai/satisfaction"
          />
        </div>
      </section>
    </div>
  );
}
