import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath, isKnownRole } from "../lib/auth";

function getCurrentPath(location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: getCurrentPath(location) }} />;
  }

  if (!isKnownRole(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardPath(currentUser)} replace />;
  }

  return <Outlet />;
}
