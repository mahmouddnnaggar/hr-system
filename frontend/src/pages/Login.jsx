import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/utils";

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser?.role === "HR") return <Navigate to="/hr/dashboard" replace />;
  if (currentUser?.role === "EMPLOYEE") return <Navigate to="/employee/dashboard" replace />;

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError("");
      const user = await login(values);
      navigate(user.role === "HR" ? "/hr/dashboard" : "/employee/dashboard", { replace: true });
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
