import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectUnauthorizedTo = "/dashboard",
}) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <LoadingScreen label="Checking your member access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to={redirectUnauthorizedTo} replace />;
  }

  return children;
}
