import Navbar from "../components/Navbar";

export default function EmployeeDashboard() {
  return (
    <div className="h-screen bg-gray-100">
      <Navbar />
      <div className="h-full flex items-center justify-center text-2xl font-bold">
        Employee Dashboard
      </div>
    </div>
  );
}
