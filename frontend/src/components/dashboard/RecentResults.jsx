import { Link } from "react-router-dom";
import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";
import { formatDate, formatScore } from "../../lib/utils";

export default function RecentResults({ results }) {
  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (result) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{result.assignment?.employee?.name}</p>
          <p className="text-xs text-slate-400">{result.assignment?.employee?.email}</p>
        </div>
      ),
    },
    {
      key: "exam",
      header: "Exam",
      render: (result) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600">{result.assignment?.exam?.title}</p>
          <StatusBadge status={result.assignment?.exam?.difficulty} />
        </div>
      ),
    },
    {
      key: "examDate",
      header: "Exam Date",
      cellClassName: "text-sm font-medium text-slate-600",
      render: (result) => formatDate(result.completed_at || result.createdAt),
    },
    {
      key: "assignedBy",
      header: "Assigned By",
      render: (result) => {
        const assignedBy = result.assignment?.assignedBy;

        return (
          <div>
            <p className="text-sm font-bold text-slate-900">{assignedBy?.name || "Unknown HR"}</p>
            {assignedBy?.email ? <p className="text-xs text-slate-500">{assignedBy.email}</p> : null}
          </div>
        );
      },
    },
    {
      key: "score",
      header: "Score",
      cellClassName: "text-center",
      render: (result) => (
        <span className="text-sm font-bold text-slate-900">
          {formatScore(result.final_score)} <span className="font-normal text-slate-400">/ 5.0</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      render: (result) => (
        <Link
          to={`/hr/results/${result.assignment?.employee?.id}/${result.id}`}
          className="text-xs font-bold uppercase text-blue-600 hover:underline"
        >
          Details
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} data={results} emptyMessage="No recent activity detected in the system." />;
}
