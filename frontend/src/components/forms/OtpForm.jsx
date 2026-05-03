import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Input from "../common/Input";
import { otpSchema } from "../../lib/validations/auth";

export default function OtpForm({ defaultEmail = "", onSubmit, error, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: defaultEmail,
      otp: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase text-slate-500">
          Email
        </label>
        <Input id="email" type="email" placeholder="name@company.com" error={errors.email} {...register("email")} />
        {errors.email ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <label htmlFor="otp" className="mb-2 block text-xs font-bold uppercase text-slate-500">
          OTP Code
        </label>
        <Input id="otp" inputMode="numeric" placeholder="6-digit code" error={errors.otp} {...register("otp")} />
        {errors.otp ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.otp.message}</p> : null}
      </div>

      <ErrorMessage message={error} />

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        <ShieldCheck size={18} />
        {loading ? "Verifying..." : "Verify Email"}
      </Button>
    </form>
  );
}
