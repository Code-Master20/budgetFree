import { useSelector } from "react-redux";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">Welcome, {user?.name} 👋</h1>

        <p>Email: {user?.email}</p>
        <p>Points: {user?.points}</p>
      </div>
    </div>
  );
}
