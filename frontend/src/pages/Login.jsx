import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import { useAuth } from "../context/AuthContext";
import { getPostLoginPath } from "../lib/auth";
import { getErrorMessage } from "../lib/utils";

export default function Login() {
  const { currentUser, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const from = location.state?.from;

  if (currentUser) return <Navigate to={getPostLoginPath(from, currentUser.role)} replace />;

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError("");
      const user = await login(values);
      navigate(getPostLoginPath(from, user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "User not found. Check the seeded backend email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
}
