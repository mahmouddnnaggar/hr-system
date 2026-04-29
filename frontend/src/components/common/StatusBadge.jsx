import { cn } from "../../lib/utils";

const styles = {
  PENDING: "border-slate-200 bg-slate-100 text-slate-600",
  COMPLETED: "border-emerald-100 bg-emerald-50 text-emerald-700",
  EASY: "border-emerald-100 bg-emerald-50 text-emerald-600",
  MEDIUM: "border-amber-100 bg-amber-50 text-amber-600",
  HARD: "border-rose-100 bg-rose-50 text-rose-600",
  YES: "border-emerald-100 bg-emerald-50 text-emerald-700",
  PARTIAL: "border-amber-100 bg-amber-50 text-amber-600",
  NO: "border-rose-100 bg-rose-50 text-rose-600",
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase",
        styles[status] || "border-slate-200 bg-slate-100 text-slate-700",
        className,
      )}
    >
      {status || "UNKNOWN"}
    </span>
  );
}
