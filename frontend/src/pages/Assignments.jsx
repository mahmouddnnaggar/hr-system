import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import DataTable from '../components/common/DataTable';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';
import PageTitle from '../components/common/PageTitle';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { formatDate, getErrorMessage } from '../lib/utils';
import { hrApi } from '../services/hrApi';

export default function Assignments() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const {
    data: assignments = [],
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ['hr', 'assignments'],
    queryFn: () => hrApi.getAssignments(),
  });

  const unassignMutation = useMutation({
    mutationFn: assignment => hrApi.unassignExam(assignment.id, currentUser.id),
    onSuccess: async () => {
      toast.success('Exam unassigned successfully');
      setSelectedAssignment(null);
      await queryClient.invalidateQueries({ queryKey: ['hr', 'assignments'] });
    },
    onError: err => {
      toast.error(getErrorMessage(err));
    },
  });

  if (loading) return <LoadingState label="Loading assigned exams" />;

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: assignment => (
        <div>
          <p className="text-sm font-bold text-slate-900">
            {assignment.employee?.name}
          </p>
          <p className="text-xs text-slate-500">{assignment.employee?.email}</p>
        </div>
      ),
    },
    {
      key: 'exam',
      header: 'Exam',
      render: assignment => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700">
            {assignment.exam?.title}
          </p>
          <StatusBadge status={assignment.exam?.difficulty} />
        </div>
      ),
    },
    {
      key: 'assignedBy',
      header: 'Assigned By',
      render: assignment => (
        <div>
          <p className="text-sm font-bold text-slate-900">
            {assignment.assignedBy?.name || 'Unknown HR'}
          </p>
          {assignment.assignedBy?.email ? (
            <p className="text-xs text-slate-500">
              {assignment.assignedBy.email}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'assignedAt',
      header: 'Assigned Date',
      cellClassName: 'text-sm font-medium text-slate-600',
      render: assignment => formatDate(assignment.assigned_at),
    },
    {
      key: 'status',
      header: 'Status',
      cellClassName: 'text-center',
      render: assignment => <StatusBadge status={assignment.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cellClassName: 'text-right',
      render: assignment => {
        const isOwner =
          Number(assignment.assigned_by) === Number(currentUser.id);
        const canUnassign =
          isOwner && assignment.status !== 'COMPLETED' && !assignment.result;
        const label =
          assignment.status === 'COMPLETED' ? 'Completed' : 'Owner only';

        if (!canUnassign) {
          return (
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {label}
            </span>
          );
        }

        return (
          <Button
            variant="danger"
            size="sm"
            className="text-[10px] uppercase"
            onClick={() => setSelectedAssignment(assignment)}
          >
            <Trash2 size={13} />
            Unassign
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Assigned Exams"
        description={`${assignments.length} active and completed assignments`}
        action={
          <Button as={Link} to="/hr/assign-exam" className="w-full sm:w-auto">
            <span className="text-white">
              <PlusCircle size={18} />
            </span>
            <span className="text-white">Assign Exam</span>
          </Button>
        }
      />
      <ErrorMessage message={error ? getErrorMessage(error) : ''} />
      <DataTable
        columns={columns}
        data={assignments}
        emptyMessage="No assigned exams found."
      />

      <ConfirmModal
        open={Boolean(selectedAssignment)}
        title="Unassign Exam"
        description={
          selectedAssignment
            ? `Remove ${selectedAssignment.exam?.title} from ${selectedAssignment.employee?.name}? Any saved pending answers for this assignment will also be removed.`
            : ''
        }
        confirmLabel={
          unassignMutation.isPending ? 'Unassigning...' : 'Unassign'
        }
        onCancel={() => setSelectedAssignment(null)}
        onConfirm={() =>
          selectedAssignment && unassignMutation.mutate(selectedAssignment)
        }
      />
    </div>
  );
}
