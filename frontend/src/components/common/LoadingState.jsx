export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-sm font-medium text-slate-400">
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      {label}
    </div>
  );
}
