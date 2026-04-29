import { useQuery } from '@tanstack/react-query';
import {
  Award,
  CheckCircle,
  FileText,
  PlusCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';
import PageTitle from '../components/common/PageTitle';
import StatCard from '../components/common/StatCard';
import RecentResults from '../components/dashboard/RecentResults';
import { formatScore, getErrorMessage } from '../lib/utils';
import { liveQueryOptions } from '../lib/queryClient';
import { hrApi } from '../services/hrApi';

export default function HRDashboard() {
  const dashboardMetaQuery = useQuery({
    queryKey: ['hr', 'dashboard-meta'],
    queryFn: async () => {
      const [employees, exams] = await Promise.all([
        hrApi.getEmployees(),
        hrApi.getExams(),
      ]);
      return { employees, exams };
    },
  });

  const resultsQuery = useQuery({
    queryKey: ['hr', 'results'],
    queryFn: () => hrApi.getResults(),
    ...liveQueryOptions,
  });

  const loading = dashboardMetaQuery.isPending || resultsQuery.isPending;
  const error = dashboardMetaQuery.error || resultsQuery.error;
  const employees = dashboardMetaQuery.data?.employees || [];
  const exams = dashboardMetaQuery.data?.exams || [];
  const results = resultsQuery.data || [];
  const averageScore = results.length
    ? results.reduce(
        (sum, result) => sum + Number(result.final_score || 0),
        0,
      ) / results.length
    : 0;

  if (loading) return <LoadingState label="Loading dashboard" />;

  return (
    <div className="space-y-8">
      <PageTitle
        title="HR Dashboard"
        description="Global workforce evaluation status"
        action={
          <Button
            as={Link}
            to="/hr/assign-exam"
            className="w-full sm:w-auto text-white"
          >
            <span className="text-white">
              <PlusCircle size={18} />
            </span>
            <span className="text-white">Assign New Exam</span>
          </Button>
        }
      />

      <ErrorMessage message={error ? getErrorMessage(error) : ''} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          label="Employees"
          value={employees.length}
          icon={Users}
          delay={0}
        />
        <StatCard
          label="Library Exams"
          value={exams.length}
          icon={FileText}
          color="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.05}
        />
        <StatCard
          label="Completed"
          value={results.length}
          icon={CheckCircle}
          delay={0.1}
        />
        <StatCard
          label="Average Score"
          value={results.length ? `${formatScore(averageScore)}/5` : '--'}
          icon={Award}
          color="text-amber-600"
          bg="bg-amber-50"
          delay={0.15}
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <TrendingUp size={18} className="text-blue-600" />
            Recent Submissions
          </h3>
          <Link
            to="/hr/results"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View All Records
          </Link>
        </div>
        <RecentResults results={results.slice(0, 5)} />
      </section>
    </div>
  );
}
