import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Award } from "lucide-react";
import RegisterForm from "../components/forms/RegisterForm";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../lib/auth";
import { getErrorMessage } from "../lib/utils";
import { authApi } from "../services/authApi";

export default function Register() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to={getDashboardPath(currentUser)} replace />;

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      setError("");
      const response = await authApi.register(values);
      navigate("/verify-otp", {
        replace: true,
        state: {
          email: response.email || values.email,
          message: response.message,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">HR and employee accounts need email verification and admin approval.</p>
        </div>

        <div className="px-8 pb-8">
          <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
          <p className="mt-6 text-center text-xs font-medium text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
