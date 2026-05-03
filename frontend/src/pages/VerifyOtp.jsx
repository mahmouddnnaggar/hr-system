import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Award } from "lucide-react";
import Button from "../components/common/Button";
import OtpForm from "../components/forms/OtpForm";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../lib/auth";
import { getErrorMessage } from "../lib/utils";
import { authApi } from "../services/authApi";

export default function VerifyOtp() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [lastEmail, setLastEmail] = useState(location.state?.email || "");

  if (currentUser) return <Navigate to={getDashboardPath(currentUser)} replace />;

  const handleVerify = async (values) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setLastEmail(values.email);
      const response = await authApi.verifyOtp(values);
      setSuccess(response.message || "Your account is waiting for admin approval.");
    } catch (err) {
      setError(getErrorMessage(err, "OTP verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!lastEmail) {
      setError("Enter your email before requesting a new OTP.");
      return;
    }

    try {
      setResending(true);
      setError("");
      const response = await authApi.resendOtp(lastEmail);
      setSuccess(response.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not resend OTP"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verify Email</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Enter the OTP sent to your email address.</p>
        </div>

        <div className="space-y-5 px-8 pb-8">
          {success ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          ) : null}

          <OtpForm defaultEmail={lastEmail} onSubmit={handleVerify} loading={loading} error={error} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={handleResend} disabled={resending}>
              {resending ? "Sending..." : "Resend OTP"}
            </Button>
            <Button as={Link} to="/login" variant="secondary" className="flex-1">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
