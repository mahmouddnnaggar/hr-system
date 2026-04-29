import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';
import PageTitle from '../components/common/PageTitle';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/utils';
import { liveQueryOptions } from '../lib/queryClient';
import { employeeApi } from '../services/employeeApi';

export default function MyExams() {
  const { currentUser } = useAuth();
  const {
    data: assignments = [],
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ['employee', currentUser.id, 'assigned-exams'],
    queryFn: () => employeeApi.getEmployeeExams(currentUser.id),
    enabled: Boolean(currentUser?.id),
    ...liveQueryOptions,
  });

  if (loading) return <LoadingState label="Loading assigned evaluations" />;

  return (
    <div className="space-y-6">
      <PageTitle title="Assigned Evaluations" />
      <ErrorMessage message={error ? getErrorMessage(error) : ''} />
      {!assignments?.length ? (
        <EmptyState title="No assigned evaluations found." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <StatusBadge status={assignment.status} />
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {assignment.exam?.questions_count} Metrics
                </span>
              </div>
              <h3 className="mb-6 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                {assignment.exam?.title}
              </h3>
              {assignment.status === 'COMPLETED' ? (
                <Link
                  to="/employee/results"
                  className="mt-auto rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-center text-[10px] font-bold uppercase text-slate-600 transition-all hover:border-slate-300 hover:bg-white"
                >
                  Review Results
                </Link>
              ) : (
                <Link
                  to={`/employee/exams/${assignment.id}/intro`}
                  className="mt-auto rounded-lg bg-blue-600 py-2.5 text-center text-[10px] font-bold uppercase text-white shadow-lg shadow-blue-50 transition-all hover:bg-blue-700 active:scale-95"
                >
                  <span className="text-white">Execute Session</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
