import { Upload } from "lucide-react";
import { getFileUrl } from "../../lib/utils";

export default function ImageUpload({ previewUrl, onFileChange, error }) {
  const displayUrl = previewUrl ? getFileUrl(previewUrl) : "";

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onFileChange(file);
  };

  return (
    <div className="flex min-h-[280px] flex-1 flex-col">
      <p className="mb-4 text-[10px] font-bold uppercase text-slate-400">Optional Visual Proof</p>
      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-slate-50/50 transition-all ${
          displayUrl ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        } ${error ? "border-rose-300 bg-rose-50" : ""}`}
      >
        {displayUrl ? (
          <label className="group h-full min-h-[280px] w-full cursor-pointer">
            <img src={displayUrl} alt="Evidence preview" className="h-full min-h-[280px] w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Upload size={24} />
              <span className="text-xs font-bold uppercase">Replace Evidence</span>
            </div>
            <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
          </label>
        ) : (
          <label className="flex h-full min-h-[280px] w-full cursor-pointer flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 text-blue-600 shadow-sm">
              <Upload size={28} />
            </div>
            <p className="text-sm font-bold text-slate-800">Add Visual Proof</p>
            <p className="mt-1 text-xs font-medium text-slate-400">Click to upload optional evidence</p>
            <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
          </label>
        )}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
