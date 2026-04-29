import { cn } from "../../lib/utils";

export default function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100",
        error && "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100",
        className,
      )}
      {...props}
    />
  );
}
