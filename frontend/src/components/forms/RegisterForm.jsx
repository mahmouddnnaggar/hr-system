import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Input from "../common/Input";
import Select from "../common/Select";
import { registerSchema } from "../../lib/validations/auth";

export default function RegisterForm({ onSubmit, error, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase text-slate-500">
          Full Name
        </label>
        <Input id="name" placeholder="Your name" error={errors.name} {...register("name")} />
        {errors.name ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.name.message}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase text-slate-500">
          Email
        </label>
        <Input id="email" type="email" placeholder="name@company.com" error={errors.email} {...register("email")} />
        {errors.email ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase text-slate-500">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password}
          {...register("password")}
        />
        {errors.password ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.password.message}</p> : null}
      </div>

      <div>
        <label htmlFor="role" className="mb-2 block text-xs font-bold uppercase text-slate-500">
          Account Type
        </label>
        <Select id="role" error={errors.role} {...register("role")}>
          <option value="EMPLOYEE">Employee</option>
          <option value="HR">HR</option>
        </Select>
        {errors.role ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.role.message}</p> : null}
      </div>

      <ErrorMessage message={error} />

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        <UserPlus size={18} />
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}
