import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-600">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}
