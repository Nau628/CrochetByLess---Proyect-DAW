// web/src/components/Guards.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth.jsx";

export function RequireAuth({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export function RequireRole({ role, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (user.rol !== role) return <Navigate to="/" replace />;
  return children;
}
