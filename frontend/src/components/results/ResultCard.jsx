import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import { formatDate, formatScore } from "../../lib/utils";

export default function ResultCard({ result, basePath }) {
  const exam = result.assignment?.exam;
  const employeeId = result.assignment?.employee?.id || result.assignment?.employee_id;
  const assignedBy = result.assignment?.assignedBy;

  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
          Exam Date: {formatDate(result.completed_at || result.createdAt)}
        </p>
        <h3 className="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-600">{exam?.title}</h3>
        <p className="mt-1 truncate text-xs font-medium text-slate-500">
          Assigned by <span className="font-bold text-slate-700">{assignedBy?.name || "Unknown HR"}</span>
        </p>
        <div className="mt-2">
          <StatusBadge status={exam?.difficulty} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-2xl font-black text-slate-900">
          {formatScore(result.final_score)}
          <span className="text-xs font-normal text-slate-300">/5</span>
        </p>
        <Link
          to={`${basePath}/${employeeId}/${result.id}`}
          className="mt-2 inline-block text-[10px] font-bold uppercase text-blue-600 hover:underline"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
