import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Award, CheckCircle, FileText, PlusCircle, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AssignExamForm from "../components/forms/AssignExamForm";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import StatCard from "../components/common/StatCard";
import RecentResults from "../components/dashboard/RecentResults";
import { useAuth } from "../context/AuthContext";
import { formatScore, getErrorMessage } from "../lib/utils";
import { liveQueryOptions } from "../lib/queryClient";
import { hrApi } from "../services/hrApi";
import { useState } from "react";

export default function HRDashboard() {
  const { currentUser } = useAuth();
  const [assignError, setAssignError] = useState("");
  const [assigning, setAssigning] = useState(false);

  const dashboardMetaQuery = useQuery({
    queryKey: ["hr", "dashboard-meta"],
    queryFn: async () => {
      const [employees, exams] = await Promise.all([hrApi.getEmployees(), hrApi.getExams()]);
      return { employees, exams };
    },
  });

  const resultsQuery = useQuery({
    queryKey: ["hr", "results"],
    queryFn: () => hrApi.getResults(),
    ...liveQueryOptions,
  });

  const loading = dashboardMetaQuery.isPending || resultsQuery.isPending;
  const error = dashboardMetaQuery.error || resultsQuery.error;
  const employees = dashboardMetaQuery.data?.employees || [];
  const exams = dashboardMetaQuery.data?.exams || [];
  const results = resultsQuery.data || [];
  const averageScore = results.length
    ? results.reduce((sum, result) => sum + Number(result.final_score || 0), 0) / results.length
    : 0;

  const handleAssign = async (values) => {
    try {
      setAssigning(true);
      setAssignError("");
      await hrApi.assignExam({ ...values, assigned_by: currentUser.id });
      await Promise.all([dashboardMetaQuery.refetch(), resultsQuery.refetch()]);
    } catch (err) {
      setAssignError(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingState label="Loading dashboard" />;

  return (
    <div className="space-y-8">
      <PageTitle
        title="HR Dashboard"
        description="Global workforce evaluation status"
        action={
          <Button as={Link} to="/hr/assign-exam" className="w-full sm:w-auto">
            <PlusCircle size={18} />
            Assign New Exam
          </Button>
        }
      />

      <ErrorMessage message={error ? getErrorMessage(error) : ""} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard label="Employees" value={employees.length} icon={Users} delay={0} />
        <StatCard label="Library Exams" value={exams.length} icon={FileText} color="text-emerald-600" bg="bg-emerald-50" delay={0.05} />
        <StatCard label="Completed" value={results.length} icon={CheckCircle} delay={0.1} />
        <StatCard label="Average Score" value={results.length ? `${formatScore(averageScore)}/5` : "--"} icon={Award} color="text-amber-600" bg="bg-amber-50" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-0 flex items-center justify-between rounded-t-xl border border-b-0 border-slate-200 bg-white px-6 py-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <TrendingUp size={18} className="text-blue-600" />
              Recent Submissions
            </h3>
            <Link to="/hr/results" className="text-xs font-bold text-blue-600 hover:underline">
              View All Records
            </Link>
          </div>
          <RecentResults results={results.slice(0, 5)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-slate-900">
            <PlusCircle size={18} className="text-blue-600" />
            Quick Assign
          </h3>
          <AssignExamForm
            employees={employees}
            exams={exams}
            onSubmit={handleAssign}
            loading={assigning}
            error={assignError}
          />
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-[10px] font-medium leading-relaxed text-blue-700">
              Assigned evaluations appear instantly on the employee dashboard.
            </p>
          </div>
          {!employees.length || !exams.length ? (
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-600">
              <AlertCircle size={14} />
              Seed employees and exams before assigning.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
