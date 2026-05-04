import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Award, KeyRound } from "lucide-react";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../lib/auth";
import { getErrorMessage } from "../lib/utils";
import { authApi } from "../services/authApi";

export default function ForgotPassword() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to={getDashboardPath(currentUser)} replace />;

  const requestReset = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const response = await authApi.forgotPassword(email);
      setMessage(response.message);
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err, "Could not send reset code"));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const response = await authApi.resetPassword({ email, otp, password });
      navigate("/login", { replace: true, state: { message: response.message } });
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset password"));
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
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Use the code sent to your email.</p>
        </div>

        <div className="space-y-5 px-8 pb-8">
          {message ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {message}
            </div>
          ) : null}

          {step === "request" ? (
            <form onSubmit={requestReset} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Email
                </label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <ErrorMessage message={error} />
              <Button type="submit" className="w-full" disabled={loading}>
                <KeyRound size={18} />
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label htmlFor="otp" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Reset Code
                </label>
                <Input id="otp" value={otp} onChange={(event) => setOtp(event.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <ErrorMessage message={error} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <p className="text-center text-xs font-medium text-slate-500">
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
