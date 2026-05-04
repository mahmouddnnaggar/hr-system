import { useQuery } from "@tanstack/react-query";
import { Award, ClipboardList, FileText, History, Users } from "lucide-react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTitle from "../components/common/PageTitle";
import StatCard from "../components/common/StatCard";
import { formatScore, getErrorMessage } from "../lib/utils";
import { adminApi } from "../services/adminApi";

export default function AdminDashboard() {
  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => adminApi.getAnalytics(),
  });

  if (isPending) return <LoadingState label="Loading analytics" />;

  return (
    <div className="space-y-8">
      <PageTitle title="Admin Dashboard" description="System overview and important numbers." />
      <ErrorMessage message={error ? getErrorMessage(error) : ""} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Active Users" value={data.users.total} icon={Users} />
        <StatCard label="Pending Users" value={data.users.pending} icon={History} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Removed Users" value={data.users.removed} icon={Users} color="text-rose-600" bg="bg-rose-50" />
        <StatCard label="Active Exams" value={data.exams.total} icon={ClipboardList} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Completed Assignments" value={data.assignments.completed} icon={FileText} />
        <StatCard label="Average Score" value={`${formatScore(data.results.averageScore)}/5`} icon={Award} color="text-indigo-600" bg="bg-indigo-50" />
      </div>
    </div>
  );
}
