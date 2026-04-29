import { Link } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import StatusBadge from "../components/common/StatusBadge";
import { getInitials } from "../lib/utils";
import useAsyncData from "../hooks/useAsyncData";
import { hrApi } from "../services/hrApi";

export default function Employees() {
  const { data, loading, error } = useAsyncData(async () => {
    const [employees, results] = await Promise.all([hrApi.getEmployees(), hrApi.getResults()]);
    return { employees, results };
  }, []);

  if (loading) return <LoadingState label="Loading employees" />;

  const employees = data?.employees || [];
  const results = data?.results || [];

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600">
            {getInitials(employee.name)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{employee.name}</p>
            <p className="text-xs font-medium text-slate-500">{employee.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: () => <StatusBadge status="Active" className="border-emerald-100 bg-emerald-50 text-emerald-700" />,
    },
    {
      key: "completed",
      header: "Completed",
      cellClassName: "text-center text-sm font-medium text-slate-600",
      render: (employee) => results.filter((result) => result.assignment?.employee?.id === employee.id).length,
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      render: (employee) => (
        <Link
          to={`/hr/results?employee=${employee.id}`}
          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase text-blue-600 transition-all hover:bg-blue-50 hover:underline"
        >
          Exams
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Personnel Roster" />
      <ErrorMessage message={error} />
      <DataTable columns={columns} data={employees} emptyMessage="No employees found" />
    </div>
  );
}
