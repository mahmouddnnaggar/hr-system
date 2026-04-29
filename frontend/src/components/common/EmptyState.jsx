import { FileText } from "lucide-react";

export default function EmptyState({ icon: Icon = FileText, title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <Icon size={40} className="mx-auto mb-4 text-slate-200" />
      <p className="font-bold text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}
