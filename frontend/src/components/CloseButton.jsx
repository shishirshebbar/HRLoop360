import { useNavigate } from "react-router-dom";

export default function CloseButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl font-bold"
      title="Go to Home"
    >
      ❌
    </button>
  );
}
