import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <p>Loading...</p>; // ✅ IMPORTANT

  if (!user) return <Navigate to="/login" />;

  return children;
}
