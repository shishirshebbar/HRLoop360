import { Link } from "react-router-dom";

export default function FeatureCard({ title, description, to, cta = "Open" }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      <Link
        to={to}
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
      >
        {cta} →
      </Link>
    </div>
  );
}
