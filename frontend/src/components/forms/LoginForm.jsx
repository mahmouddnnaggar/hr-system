import { zodResolver } from "@hookform/resolvers/zod";
import { Award, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Input from "../common/Input";
import { loginSchema } from "../../lib/validations/auth";

export default function LoginForm({ onSubmit, error, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <div className="p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">EvalSystem</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Enterprise Evaluation Engine</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-10 pb-10">
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase text-slate-500">
            Corporate Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            error={errors.email}
            {...register("email")}
          />
          {errors.email ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase text-slate-500">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-2 text-xs font-medium text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>

        <ErrorMessage message={error} />

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
          <ChevronRight size={18} />
        </Button>

        <p className="text-center text-xs font-medium text-slate-500">
          New to EvalSystem?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
