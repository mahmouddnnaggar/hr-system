import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Award, ChevronRight, ClipboardList, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import StatCard from "../components/common/StatCard";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { formatScore, getErrorMessage } from "../lib/utils";
import { liveQueryOptions } from "../lib/queryClient";
import { employeeApi } from "../services/employeeApi";

export default function EmployeeDashboard() {
  const { currentUser } = useAuth();

  const assignmentsQuery = useQuery({
    queryKey: ["employee", currentUser.id, "assigned-exams"],
    queryFn: () => employeeApi.getEmployeeExams(currentUser.id),
    enabled: Boolean(currentUser?.id),
    ...liveQueryOptions,
  });

  const resultsQuery = useQuery({
    queryKey: ["employee", currentUser.id, "results"],
    queryFn: () => employeeApi.getEmployeeResults(currentUser.id),
    enabled: Boolean(currentUser?.id),
  });

  const loading = assignmentsQuery.isPending || resultsQuery.isPending;
  const error = assignmentsQuery.error || resultsQuery.error;

  if (loading) return <LoadingState label="Loading employee dashboard" />;

  const assignments = assignmentsQuery.data || [];
  const results = resultsQuery.data || [];
  const pending = assignments.filter((assignment) => assignment.status === "PENDING");
  const averageScore = results.length
    ? results.reduce((sum, result) => sum + Number(result.final_score || 0), 0) / results.length
    : 0;

  return (
    <div className="space-y-8">
      <PageTitle
        title="My Portal"
        description="Compliance overview and pending tasks"
        action={
          <Button as={Link} to="/employee/exams" className="w-full sm:w-auto">
            Access Evaluations
            <ChevronRight size={16} />
          </Button>
        }
      />

      <ErrorMessage message={error ? getErrorMessage(error) : ""} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Total Tasks" value={assignments.length} icon={ClipboardList} />
        <StatCard label="Awaiting Action" value={pending.length} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50" delay={0.05} />
        <StatCard
          label="Performance Rating"
          value={results.length ? `${formatScore(averageScore)}/5` : "--"}
          icon={Award}
          color="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.1}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <AlertCircle size={18} className="text-amber-600" />
          <h3 className="font-bold text-slate-900">Task Queue</h3>
        </div>
        <div className="p-2">
          {!pending.length ? (
            <EmptyState title="You are fully compliant with all assigned evaluations." />
          ) : (
            <div className="space-y-1">
              {pending.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/employee/exams/${assignment.id}/intro`}
                  className="group flex flex-col gap-4 rounded-lg border border-transparent bg-white p-4 transition-colors hover:border-slate-100 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-colors group-hover:text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{assignment.exam?.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StatusBadge status={assignment.exam?.difficulty} />
                        <span className="text-[10px] font-bold uppercase text-slate-400">{assignment.exam?.questions_count} Metrics</span>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase text-blue-600 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    Start Task
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
